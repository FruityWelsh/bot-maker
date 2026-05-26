#!/usr/bin/env python3
"""
CI/CD Generator from Intermediate Representation (IR)

This script reads the cicd-ir.yaml file and generates platform-specific CI/CD
configurations that are THIN WRAPPERS around Make targets.

ALL LOGIC IS IN THE MAKEFILE - the generated configs just invoke Make targets.

Usage:
    python3 generate-cicd.py [--platform github|gitlab|tekton|all] [--output-dir .]
"""

import yaml
import argparse
import os
from pathlib import Path
from typing import Dict, Any, List


class CICDGenerator:
    """Generates CI/CD configurations from IR YAML."""
    
    def __init__(self, ir_path: str = "cicd-ir.yaml"):
        """Load the IR YAML file."""
        with open(ir_path, 'r') as f:
            self.ir = yaml.safe_load(f)
        
        self.pipeline = self.ir.get('pipeline', {})
        self.config = self.ir.get('config', {})
        self.triggers = self.ir.get('triggers', {})
        self.phases = self.ir.get('phases', [])
        self.jobs = self.ir.get('jobs', {})
        self.platforms = self.ir.get('platforms', {})
        self.make_dependencies = self.ir.get('make_dependencies', {})
    
    def _resolve_template(self, text: str) -> str:
        """Resolve template variables in text."""
        if not text:
            return text
        for key, value in self.config.items():
            placeholder = f"${{{{ config.{key} }}}}"
            text = text.replace(placeholder, str(value))
        return text
    
    def _get_job_dependencies(self, job_name: str) -> List[str]:
        """Get all job dependencies for a given job."""
        deps = set()
        job = self.jobs.get(job_name, {})
        phase_id = job.get('phase', '')
        phase = next((p for p in self.phases if p['id'] == phase_id), None)
        if phase:
            for need_phase_id in phase.get('needs', []):
                need_phase = next((p for p in self.phases if p['id'] == need_phase_id), None)
                if need_phase:
                    deps.update(need_phase.get('jobs', []))
        if job.get('needs'):
            deps.update(job['needs'])
        make_target = job.get('make_target')
        if make_target and make_target in self.make_dependencies:
            deps.update(self.make_dependencies[make_target])
        return list(deps)
    
    def generate_github(self) -> str:
        """Generate GitHub Actions workflow - thin wrapper around Make targets."""
        lines = []
        lines.append(f"name: {self.pipeline.get('name', 'CI')}")
        lines.append("")
        lines.append("# ============================================================================")
        lines.append("# ChatBot Operator CI - GitHub Actions")
        lines.append("# ============================================================================")
        lines.append("")
        lines.append("# IMPORTANT: ALL LOGIC IS IN THE MAKEFILE")
        lines.append("# This workflow is a thin wrapper that invokes Make targets.")
        lines.append("# See Makefile for actual implementation.")
        lines.append("")
        for ref in self.pipeline.get('references', []):
            lines.append(f"# {ref}")
        lines.append("")
        lines.append("# Pipeline Flow:")
        for phase in self.phases:
            pid = phase.get('id', '')
            pname = phase.get('name', '')
            pdesc = phase.get('description', '').split('\n')[0]
            lines.append(f"#   {pid}: {pname} - {pdesc}")
        lines.append("")
        lines.append("# IMPORTANT: NO BYPASS METHODS. All jobs must pass. Test in pipeline.")
        lines.append("# Container build is FIRST to ensure it's available for scan jobs.")
        lines.append("")
        lines.append("on:")
        if self.triggers.get('push'):
            lines.append("  push:")
            lines.append(f"    branches: {self.triggers['push']['branches']}")
        if self.triggers.get('pull_request'):
            lines.append("  pull_request:")
            lines.append(f"    branches: {self.triggers['pull_request']['branches']}")
        if self.triggers.get('schedule'):
            lines.append("  schedule:")
            for schedule in self.triggers['schedule']:
                lines.append(f"    - cron: '{schedule['cron']}'")
        if self.triggers.get('manual', {}).get('enabled'):
            lines.append("  workflow_dispatch:")
        lines.append("")
        lines.append("jobs:")
        for phase in sorted(self.phases, key=lambda p: p.get('priority', 0)):
            for job_name in phase.get('jobs', []):
                job = self.jobs.get(job_name, {})
                if not job:
                    continue
                lines.append(f"  {job.get('name', job_name)}:")
                lines.append(f"    name: {job.get('name', job_name)}")
                desc = job.get('description', '')
                if desc:
                    if len(desc) > 80:
                        desc = desc[:77] + "..."
                    lines.append(f"    # {desc}")
                lines.append("    runs-on: ubuntu-latest")
                container = job.get('container')
                if container:
                    container = self._resolve_template(container)
                    lines.append(f"    container: {container}")
                if job_name == 'build-security-container':
                    lines.append("    permissions:")
                    lines.append("      contents: read")
                    lines.append("      packages: write")
                needs = self._get_job_dependencies(job_name)
                if needs:
                    needs = [n for n in needs if n in self.jobs]
                    if needs:
                        lines.append(f"    needs: [{', '.join(needs)}]")
                if job.get('if'):
                    lines.append(f"    if: {job['if']}")
                if job.get('environment'):
                    lines.append("    environment:")
                    lines.append(f"      name: {job['environment']['name']}")
                    lines.append(f"      url: {job['environment']['url']}")
                lines.append("    steps:")
                lines.append("      - name: Checkout repository")
                lines.append("        uses: actions/checkout@v4")
                lines.append("        with:")
                lines.append("          fetch-depth: 0")
                if job_name == 'build-security-container':
                    lines.append("")
                    lines.append("      - name: Set up Docker Buildx")
                    lines.append("        uses: docker/setup-buildx-action@v3")
                    lines.append("")
                    lines.append("      - name: Log in to Container Registry")
                    lines.append("        uses: docker/login-action@v3")
                    lines.append("        with:")
                    lines.append("          registry: ghcr.io")
                    lines.append("          username: ${{ github.actor }}")
                    lines.append("          password: ${{ secrets.GITHUB_TOKEN }}")
                    lines.append("")
                    lines.append("      - name: Build and Push Security Scanner Container")
                    lines.append("        uses: docker/build-push-action@v5")
                    lines.append("        with:")
                    lines.append("          context: .")
                    lines.append("          file: Dockerfile.security-scanner")
                    lines.append("          push: true")
                    lines.append("          tags: ghcr.io/fruitywelsh/security-scanner:latest")
                    lines.append("          cache-from: type=gha")
                    lines.append("          cache-to: type=gha,mode=max")
                elif job_name == 'sign-artifacts':
                    lines.append("")
                    lines.append("      - name: Set up Cosign")
                    lines.append("        uses: sigstore/cosign-installer@v3")
                    lines.append("")
                    lines.append("      - name: Sign artifacts")
                    lines.append("        run: make ci-sign")
                elif job_name == 'publish-artifacts':
                    lines.append("")
                    lines.append("      - name: Set up Docker Buildx")
                    lines.append("        uses: docker/setup-buildx-action@v3")
                    lines.append("")
                    lines.append("      - name: Log in to Docker Hub")
                    lines.append("        uses: docker/login-action@v3")
                    lines.append("        with:")
                    lines.append("          username: ${{ secrets.DOCKER_USERNAME }}")
                    lines.append("          password: ${{ secrets.DOCKER_PASSWORD }}")
                    lines.append("")
                    lines.append("      - name: Publish Docker image")
                    lines.append("        run: make ci-package")
                elif job_name == 'deploy':
                    lines.append("")
                    lines.append("      - name: Set up kubectl")
                    lines.append("        uses: azure/setup-kubectl@v3")
                    lines.append("")
                    lines.append("      - name: Deploy")
                    lines.append("        run: make ci-deploy")
                elif job_name == 'upload':
                    lines.append("")
                    lines.append("      - name: Create artifact directories")
                    lines.append("        run: mkdir -p dist coverage reports")
                    lines.append("")
                    lines.append("      - name: Upload artifacts")
                    lines.append("        uses: actions/upload-artifact@v4")
                    lines.append("        with:")
                    lines.append("          name: ci-artifacts")
                    lines.append("          path: \"dist/ coverage/ reports/ *.sbom *.sig *.attestation\"")
                else:
                    make_target = job.get('make_target')
                    if make_target:
                        lines.append("")
                        lines.append(f"      - name: Run Make target")
                        lines.append(f"        run: make {make_target}")
                    else:
                        lines.append("")
                        lines.append("      - name: Run task")
                        lines.append(f"        run: echo 'Job {job_name} - ALL LOGIC IN MAKEFILE'")
                lines.append("")
        return '\n'.join(lines)
    
    def generate_gitlab(self) -> str:
        """Generate GitLab CI/CD configuration - thin wrapper around Make targets."""
        lines = []
        lines.append("# ============================================================================")
        lines.append("# ChatBot Operator GitLab CI/CD Configuration")
        lines.append("# ============================================================================")
        lines.append("")
        lines.append("# IMPORTANT: ALL LOGIC IS IN THE MAKEFILE")
        lines.append("# This configuration is a thin wrapper that invokes Make targets.")
        lines.append("# See Makefile for actual implementation.")
        lines.append("")
        refs = self.pipeline.get('references', [])
        if refs:
            lines.append(f"# References: {refs[0]}")
        lines.append("# The actual checks are defined in the Makefile.")
        lines.append("# GitLab CI is just a wrapper around: make ci-lint, make ci-test, etc.")
        lines.append("")
        stage_names = [p.get('name', p.get('id', '')) for p in self.phases]
        lines.append("stages:")
        for stage in stage_names:
            lines.append(f"  - {stage}")
        lines.append("")
        lines.append("variables:")
        lines.append("  # Platform identification for Make targets")
        lines.append("  CI_PLATFORM: gitlab")
        lines.append("  CI_COMMIT: $CI_COMMIT_SHA")
        lines.append("  CI_BRANCH: $CI_COMMIT_REF_NAME")
        lines.append("  CI_REPO: $CI_PROJECT_PATH")
        lines.append("  CI_PIPELINE_ID: $CI_PIPELINE_ID")
        lines.append("  CI_JOB_ID: $CI_JOB_ID")
        lines.append("")
        lines.append("# Cache configuration for dependencies")
        lines.append("cache:")
        lines.append("  key: ${CI_COMMIT_REF_SLUG}")
        lines.append("  paths:")
        lines.append("    - vendor/")
        lines.append("    - node_modules/")
        lines.append("    - bin/")
        lines.append("    - .cache/")
        lines.append("")
        for phase in sorted(self.phases, key=lambda p: p.get('priority', 0)):
            phase_name = phase.get('name', phase.get('id', ''))
            for job_name in phase.get('jobs', []):
                job = self.jobs.get(job_name, {})
                if not job:
                    continue
                gitlab_job_name = job_name.replace('-', '_')
                lines.append(f"{gitlab_job_name}:")
                lines.append(f"  stage: {phase_name}")
                container = job.get('container')
                if container:
                    container = self._resolve_template(container)
                    lines.append(f"  image: {container}")
                else:
                    lines.append("  image: alpine:latest")
                lines.append("  script:")
                if job_name == 'build-security-container':
                    lines.append("    - echo \"Building security scanner container...\"")
                    lines.append("    - apk add --no-cache docker")
                    lines.append("    - docker build -t ghcr.io/fruitywelsh/security-scanner:latest -f Dockerfile.security-scanner .")
                    lines.append("    - docker push ghcr.io/fruitywelsh/security-scanner:latest")
                elif job_name == 'upload':
                    lines.append("    - echo \"Uploading artifacts...\"")
                    lines.append("    - mkdir -p dist coverage reports")
                    lines.append("    - echo \"Artifacts ready for upload (handled by GitLab artifacts)\"")
                else:
                    make_target = job.get('make_target')
                    if make_target:
                        lines.append(f"    - echo \"Running: make {make_target}\"")
                        lines.append(f"    - make {make_target}")
                    else:
                        lines.append(f"    - echo \"Job {job_name} - ALL LOGIC IN MAKEFILE\"")
                lines.append("")
                needs = self._get_job_dependencies(job_name)
                if needs:
                    needed_jobs = [n.replace('-', '_') for n in needs if n in self.jobs]
                    if needed_jobs:
                        lines.append(f"  needs: [{', '.join(needed_jobs)}]")
                        lines.append("")
                if job.get('needs'):
                    needed = [n.replace('-', '_') for n in job['needs']]
                    lines.append(f"  needs: [{', '.join(needed)}]")
                    lines.append("")
                if job_name == 'setup':
                    lines.append("  artifacts:")
                    lines.append("    paths:")
                    lines.append("      - vendor/")
                    lines.append("      - node_modules/")
                    lines.append("      - bin/")
                    lines.append("    expire_in: 1 hour")
                    lines.append("")
                if job.get('manual'):
                    lines.append("  when: manual")
                    lines.append("")
        lines.append("cleanup:")
        lines.append("  stage: .post")
        lines.append("  image: alpine:latest")
        lines.append("  script:")
        lines.append("    - echo \"Cleaning up...\"")
        lines.append("    - make clean")
        lines.append("  when: always")
        return '\n'.join(lines)
    
    def generate_tekton(self) -> Dict[str, str]:
        """Generate Tekton pipeline and tasks - thin wrappers around Make targets."""
        pipeline_lines = []
        tasks_lines = []
        pipeline_lines.append("apiVersion: tekton.dev/v1")
        pipeline_lines.append("kind: Pipeline")
        pipeline_lines.append("metadata:")
        pipeline_lines.append("  name: chatbot-operator-ci")
        pipeline_lines.append("  labels:")
        pipeline_lines.append("    app: chatbot-operator")
        pipeline_lines.append("    type: ci-pipeline")
        pipeline_lines.append("  annotations:")
        pipeline_lines.append("    description: \"Platform-agnostic CI pipeline for ChatBot Operator. Wraps Make targets.\"")
        pipeline_lines.append("    author: \"Strategy Coder\"")
        pipeline_lines.append("    version: \"2026-05-26\"")
        refs = self.pipeline.get('references', [])
        if refs:
            pipeline_lines.append(f"    references: \"{', '.join(refs)}\"")
        pipeline_lines.append("")
        pipeline_lines.append("spec:")
        pipeline_lines.append("  description: |")
        pipeline_lines.append("    ALL LOGIC IS IN THE MAKEFILE")
        pipeline_lines.append("    This Tekton pipeline is a thin wrapper that invokes Make targets.")
        pipeline_lines.append("")
        pipeline_lines.append("  params:")
        pipeline_lines.append("    - name: git-url")
        pipeline_lines.append("      type: string")
        pipeline_lines.append("      description: Git repository URL")
        pipeline_lines.append(f"      default: \"https://github.com/{self.config.get('repo_owner', '')}/{self.config.get('repo_name', '')}.git\"")
        pipeline_lines.append("")
        pipeline_lines.append("    - name: git-revision")
        pipeline_lines.append("      type: string")
        pipeline_lines.append("      description: Git commit SHA")
        pipeline_lines.append("      default: \"main\"")
        pipeline_lines.append("")
        pipeline_lines.append("    - name: image-registry")
        pipeline_lines.append("      type: string")
        pipeline_lines.append("      description: Container registry for built images")
        pipeline_lines.append(f"      default: \"{self.config.get('registry', 'ghcr.io')}\"")
        pipeline_lines.append("")
        pipeline_lines.append("    - name: image-repo")
        pipeline_lines.append("      type: string")
        pipeline_lines.append("      description: Container repository name")
        pipeline_lines.append(f"      default: \"{self.config.get('image_repo', 'chatbot-operator')}\"")
        pipeline_lines.append("")
        pipeline_lines.append("  workspaces:")
        pipeline_lines.append("    - name: source")
        pipeline_lines.append("      description: Source code workspace")
        pipeline_lines.append("    - name: artifacts")
        pipeline_lines.append("      description: Build artifacts workspace")
        pipeline_lines.append("")
        pipeline_lines.append("  tasks:")
        for phase in sorted(self.phases, key=lambda p: p.get('priority', 0)):
            for job_name in phase.get('jobs', []):
                job = self.jobs.get(job_name, {})
                if not job:
                    continue
                tekton_job_name = job_name.replace('-', '-')
                needs = self._get_job_dependencies(job_name)
                run_after = [n.replace('-', '-') for n in needs if n in self.jobs]
                pipeline_lines.append(f"    - name: {tekton_job_name}")
                if run_after:
                    pipeline_lines.append(f"      runAfter: [{', '.join(run_after)}]")
                pipeline_lines.append("      taskRef:")
                pipeline_lines.append(f"        name: chatbot-operator-{tekton_job_name}")
                params = []
                if job_name in ['build', 'package']:
                    params.append("image-registry")
                    params.append("image-repo")
                if params:
                    pipeline_lines.append("      params:")
                    for param in params:
                        pipeline_lines.append(f"        - name: {param}")
                        pipeline_lines.append(f"          value: $(params.{param})")
                pipeline_lines.append("      workspaces:")
                pipeline_lines.append("        - name: source")
                pipeline_lines.append("          workspace: source")
                pipeline_lines.append("        - name: artifacts")
                pipeline_lines.append("          workspace: artifacts")
                pipeline_lines.append("")
        pipeline_lines.append("  finally:")
        pipeline_lines.append("    - name: cleanup")
        pipeline_lines.append("      taskRef:")
        pipeline_lines.append("        name: chatbot-operator-cleanup")
        pipeline_lines.append("      workspaces:")
        pipeline_lines.append("        - name: source")
        pipeline_lines.append("          workspace: source")
        pipeline_lines.append("        - name: artifacts")
        pipeline_lines.append("          workspace: artifacts")
        for phase in sorted(self.phases, key=lambda p: p.get('priority', 0)):
            for job_name in phase.get('jobs', []):
                job = self.jobs.get(job_name, {})
                if not job:
                    continue
                tekton_job_name = job_name.replace('-', '-')
                tasks_lines.append("---")
                tasks_lines.append("apiVersion: tekton.dev/v1")
                tasks_lines.append("kind: Task")
                tasks_lines.append("metadata:")
                tasks_lines.append(f"  name: chatbot-operator-{tekton_job_name}")
                tasks_lines.append("  labels:")
                tasks_lines.append("    app: chatbot-operator")
                tasks_lines.append("    type: ci-task")
                tasks_lines.append("")
                desc = job.get('description', job_name)
                if len(desc) > 60:
                    desc = desc[:57] + "..."
                tasks_lines.append(f"spec:")
                tasks_lines.append("  description: |")
                tasks_lines.append(f"    ALL LOGIC IS IN THE MAKEFILE")
                tasks_lines.append(f"    This task invokes: make {job.get('make_target', job_name)}")
                tasks_lines.append("")
                tasks_lines.append("  workspaces:")
                tasks_lines.append("    - name: source")
                tasks_lines.append("    - name: artifacts")
                tasks_lines.append("")
                tasks_lines.append("  steps:")
                if job_name != 'build-security-container':
                    tasks_lines.append("    - name: checkout")
                    tasks_lines.append("      image: alpine/git")
                    tasks_lines.append("      script: |")
                    tasks_lines.append("        git clone $(params.git-url) $(workspaces.source.path)")
                    tasks_lines.append("        cd $(workspaces.source.path)")
                    tasks_lines.append("        git checkout $(params.git-revision)")
                make_target = job.get('make_target')
                if make_target:
                    tasks_lines.append("    - name: run")
                    tasks_lines.append("      image: alpine:latest")
                    tasks_lines.append("      workingDir: $(workspaces.source.path)")
                    tasks_lines.append("      script: |")
                    tasks_lines.append(f"        make {make_target}")
                else:
                    tasks_lines.append("    - name: run")
                    tasks_lines.append("      image: alpine:latest")
                    tasks_lines.append("      script: |")
                    tasks_lines.append(f"        echo 'Job {job_name} - ALL LOGIC IN MAKEFILE'")
                tasks_lines.append("")
        tasks_lines.append("---")
        tasks_lines.append("apiVersion: tekton.dev/v1")
        tasks_lines.append("kind: Task")
        tasks_lines.append("metadata:")
        tasks_lines.append("  name: chatbot-operator-cleanup")
        tasks_lines.append("")
        tasks_lines.append("spec:")
        tasks_lines.append("  workspaces:")
        tasks_lines.append("    - name: source")
        tasks_lines.append("    - name: artifacts")
        tasks_lines.append("")
        tasks_lines.append("  steps:")
        tasks_lines.append("    - name: cleanup")
        tasks_lines.append("      image: alpine:latest")
        tasks_lines.append("      script: |")
        tasks_lines.append("        make clean")
        return {
            'pipeline.yaml': '\n'.join(pipeline_lines),
            'tasks.yaml': '\n'.join(tasks_lines)
        }


def main():
    parser = argparse.ArgumentParser(description='Generate CI/CD configurations from IR')
    parser.add_argument('--platform', choices=['github', 'gitlab', 'tekton', 'all'], 
                        default='all', help='Platform to generate')
    parser.add_argument('--output-dir', default='.', help='Output directory')
    parser.add_argument('--ir-path', default='cicd-ir.yaml', help='Path to IR YAML file')
    args = parser.parse_args()
    generator = CICDGenerator(args.ir_path)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    if args.platform in ['github', 'all']:
        github_content = generator.generate_github()
        github_path = output_dir / ".github" / "workflows" / "ci.yml"
        github_path.parent.mkdir(parents=True, exist_ok=True)
        with open(github_path, 'w') as f:
            f.write(github_content)
        print(f"✅ Generated GitHub workflow: {github_path}")
    if args.platform in ['gitlab', 'all']:
        gitlab_content = generator.generate_gitlab()
        gitlab_path = output_dir / ".gitlab-ci.yml"
        with open(gitlab_path, 'w') as f:
            f.write(gitlab_content)
        print(f"✅ Generated GitLab CI: {gitlab_path}")
    if args.platform in ['tekton', 'all']:
        tekton_files = generator.generate_tekton()
        tekton_dir = output_dir / ".tekton"
        tekton_dir.mkdir(parents=True, exist_ok=True)
        for filename, content in tekton_files.items():
            tekton_path = tekton_dir / filename
            with open(tekton_path, 'w') as f:
                f.write(content)
            print(f"✅ Generated Tekton {filename}: {tekton_path}")


if __name__ == '__main__':
    main()
