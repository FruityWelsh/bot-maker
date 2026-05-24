#!/usr/bin/env node
/**
 * Dynamic Date Generation Script
 * 
 * Rule: Do not manually add dates - use tools that reference real time
 * This script generates current dates for documentation
 */

const { format } = require('date-fns');

// Generate current date in ISO format
const currentDate = new Date().toISOString().split('T')[0];

// Generate current date in readable format
const readableDate = format(new Date(), 'yyyy-MM-dd');

console.log(`Current ISO Date: ${currentDate}`);
console.log(`Current Readable Date: ${readableDate}`);

module.exports = {
  currentDate,
  readableDate,
  getCurrentDate: () => new Date().toISOString().split('T')[0],
  getReadableDate: () => format(new Date(), 'yyyy-MM-dd')
};