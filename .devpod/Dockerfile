# DevPod Dockerfile for ChatBot Operator Development
# =====================================================
# Multi-stage build for a complete development environment
# References: docs/omen/strategy.json (Developer Environment Goal DG001)
# References: docs/adr/architecture-decisions.md (ADR-012)

# Stage 1: Base image with essential tools
FROM registry.opensuse.org/bci/bci-base:latest AS base

# Set environment variables
ENV TZ=UTC
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Install system dependencies
RUN zypper -n refresh && zypper -n install --no-recommends \
    ca-certificates \
    ca-certificates-mozilla \
    curl \
    wget \
    git \
    make \
    gcc \
    gcc-c++ \
    pkg-config \
    gnupg2 \
    && zypper clean --all

# Stage 2: Install Go
FROM base AS go

ARG GO_VERSION=1.21.0
ARG GO_ARCH=amd64

# Download and install Go
RUN curl -L https://golang.org/dl/go${GO_VERSION}.linux-${GO_ARCH}.tar.gz | tar -xz -C /usr/local
ENV PATH=/usr/local/go/bin:${PATH}
ENV GOPATH=/root/go
ENV GOBIN=/root/go/bin

# Verify Go installation
RUN go version

# Stage 3: Install Node.js
FROM go AS node

ARG NODE_VERSION=20

# Install Node.js using nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION} && nvm use ${NODE_VERSION}
ENV PATH=/root/.nvm/versions/node/v${NODE_VERSION}/bin:${PATH}

# Verify Node.js installation
RUN node --version && npm --version

# Stage 4: Install Kubernetes tools
FROM node AS k8s

# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install kubebuilder
ARG KUBEBUILDER_VERSION=3.12.0
RUN curl -L -o kubebuilder https://go.kubebuilder.io/dl/${KUBEBUILDER_VERSION}/linux/amd64
RUN chmod +x kubebuilder && mv kubebuilder /usr/local/bin/

# Verify installations
RUN kubectl version --client && kubebuilder version

# Stage 5: Install security and linting tools
FROM k8s AS tools

# Install golangci-lint
ARG GOLANGCI_LINT_VERSION=v1.55.2
RUN curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b /usr/local/bin ${GOLANGCI_LINT_VERSION}

# Install Godog
RUN GO111MODULE=on go install github.com/cucumber/godog/cmd/godog@v0.12.6

# Install yamllint
RUN pip3 install yamllint==1.30.0

# Install markdownlint
RUN npm install -g markdownlint-cli@0.37.0

# Install shellcheck
RUN zypper -n install --no-recommends shellcheck && zypper clean --all

# Install cosign
RUN curl -LO https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64 \
    && chmod +x cosign-linux-amd64 && mv cosign-linux-amd64 /usr/local/bin/cosign

# Install syft
RUN curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# Install trivy
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Install gosec
RUN curl -sfL https://raw.githubusercontent.com/securego/gosec/master/install.sh | sh -s -- -b /usr/local/bin

# Install govulncheck
RUN go install golang.org/x/vuln/cmd/govulncheck@latest

# Install betterleaks
RUN zypper -n install --no-recommends curl && \
    curl -L https://github.com/betterleaks/betterleaks/releases/latest/download/betterleaks_linux_x86_64 -o /usr/local/bin/betterleaks && \
    chmod +x /usr/local/bin/betterleaks && zypper clean --all

# Stage 6: Final development environment
FROM tools AS devpod

# Create developer user
RUN groupadd -g 1000 developer && \
    useradd -u 1000 -g 1000 -m -d /home/developer -s /bin/bash developer && \
    mkdir -p /home/developer/.ssh && \
    chown -R developer:developer /home/developer

# Set up workspace directory
RUN mkdir -p /workspace && chown developer:developer /workspace

# Set up Go workspace
RUN mkdir -p /root/go/{bin,pkg,src} && chown -R developer:developer /root/go

# Switch to developer user
USER developer
WORKDIR /workspace

# Set environment variables
ENV HOME=/home/developer
ENV PS1='\u@\h:\w\$ '
ENV CI_PLATFORM=devpod
ENV CI_REPO=FruityWelsh/bot-maker

# Install npm dependencies for the project
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy project files
COPY . .

# Set default command
CMD ["/bin/bash"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD make doctor || exit 1

# Metadata
LABEL maintainer="FruityWelsh"
LABEL description="DevPod container for ChatBot Operator development"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/FruityWelsh/bot-maker"
