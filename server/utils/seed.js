// Populates sample vendors, routing configs, and logs for local development/testing.
// Removes all previous data before seeding to ensure no duplicates or glitches occur.
// Run with: npm run seed (inside server/)
require('dotenv').config();
const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Vendor = require('../models/Vendor');
const RoutingConfig = require('../models/RoutingConfig');
const RoutingLog = require('../models/RoutingLog');

const sampleVendors = [
  {
    name: 'Vendor A',
    priority: 1,
    weight: 50,
    costPerRequest: 0.05,
    timeoutMs: 2000,
    rateLimitPerMinute: 120,
    supportedFeatures: ['PAN_VERIFICATION', 'OCR', 'SMS'],
    healthStatus: 'healthy',
    isActive: true,
    currentLatency: 118,
    metrics: {
      totalRequests: 1250,
      successfulRequests: 1244,
      failedRequests: 6,
      averageLatency: 118,
      errorRate: 0.48,
      successRate: 99.52,
      timesConsidered: 1300,
      timesUnavailable: 0,
      lastUsedTime: new Date(Date.now() - 1000 * 60 * 5),
    },
  },
  {
    name: 'Vendor B',
    priority: 2,
    weight: 30,
    costPerRequest: 0.08,
    timeoutMs: 2500,
    rateLimitPerMinute: 80,
    supportedFeatures: ['PAN_VERIFICATION', 'PAYMENT_PROCESSING', 'DOCUMENT_VALIDATION'],
    healthStatus: 'healthy',
    isActive: true,
    currentLatency: 185,
    metrics: {
      totalRequests: 840,
      successfulRequests: 823,
      failedRequests: 17,
      averageLatency: 185,
      errorRate: 2.02,
      successRate: 97.98,
      timesConsidered: 900,
      timesUnavailable: 5,
      lastUsedTime: new Date(Date.now() - 1000 * 60 * 12),
    },
  },
  {
    name: 'Vendor C',
    priority: 3,
    weight: 20,
    costPerRequest: 0.02,
    timeoutMs: 3000,
    rateLimitPerMinute: 200,
    supportedFeatures: ['OCR', 'SMS', 'PAYMENT_PROCESSING', 'DOCUMENT_VALIDATION'],
    healthStatus: 'healthy',
    isActive: true,
    currentLatency: 310,
    metrics: {
      totalRequests: 2100,
      successfulRequests: 2079,
      failedRequests: 21,
      averageLatency: 310,
      errorRate: 1.0,
      successRate: 99.0,
      timesConsidered: 2200,
      timesUnavailable: 0,
      lastUsedTime: new Date(Date.now() - 1000 * 60 * 2),
    },
  },
  {
    name: 'Vendor D',
    priority: 4,
    weight: 10,
    costPerRequest: 0.04,
    timeoutMs: 1500,
    rateLimitPerMinute: 50,
    supportedFeatures: ['PAN_VERIFICATION', 'DOCUMENT_VALIDATION'],
    healthStatus: 'unhealthy',
    unhealthySince: new Date(Date.now() - 1000 * 60 * 10),
    isActive: true,
    currentLatency: 1250,
    metrics: {
      totalRequests: 140,
      successfulRequests: 63,
      failedRequests: 77,
      averageLatency: 1250,
      errorRate: 55.0,
      successRate: 45.0,
      timesConsidered: 300,
      timesUnavailable: 120,
      lastUsedTime: new Date(Date.now() - 1000 * 60 * 30),
    },
  },
  {
    name: 'Vendor E',
    priority: 5,
    weight: 10,
    costPerRequest: 0.15,
    timeoutMs: 2000,
    rateLimitPerMinute: 100,
    supportedFeatures: ['OCR', 'SMS', 'PAYMENT_PROCESSING'],
    healthStatus: 'healthy',
    isActive: false,
    currentLatency: 210,
    metrics: {
      totalRequests: 320,
      successfulRequests: 304,
      failedRequests: 16,
      averageLatency: 210,
      errorRate: 5.0,
      successRate: 95.0,
      timesConsidered: 400,
      timesUnavailable: 50,
      lastUsedTime: new Date(Date.now() - 1000 * 60 * 120),
    },
  },
];

const sampleConfigs = [
  {
    sourceText: 'Use Vendor A for 80% of traffic and Vendor B for 20%, but switch to Vendor C if latency exceeds 2 seconds.',
    strategy: 'weighted',
    vendorOrder: ['Vendor A', 'Vendor B', 'Vendor C'],
    weights: [
      { vendor: 'Vendor A', percentage: 80 },
      { vendor: 'Vendor B', percentage: 20 },
    ],
    conditions: [
      { metric: 'latency', operator: '>', value: 2000, unit: 'ms', action: 'switchTo', vendor: 'Vendor C' },
    ],
    appliedToVendors: ['Vendor A', 'Vendor B', 'Vendor C'],
    isActive: true,
    capability: 'PAN_VERIFICATION',
  },
  {
    sourceText: 'Route all my traffic using the lowestCost strategy. If the error rate exceeds 5%, switch to Vendor C.',
    strategy: 'lowestCost',
    vendorOrder: ['Vendor C', 'Vendor A', 'Vendor B'],
    weights: null,
    conditions: [
      { metric: 'errorRate', operator: '>', value: 5, unit: '%', action: 'switchTo', vendor: 'Vendor C' },
    ],
    appliedToVendors: ['Vendor C', 'Vendor A', 'Vendor B'],
    isActive: false,
    capability: 'OCR',
  },
];

const sampleLogs = [
  {
    requestId: randomUUID(),
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    capability: 'PAN_VERIFICATION',
    selectedVendor: 'Vendor A',
    routingStrategy: 'priority',
    routingReason: 'Highest priority (1) among eligible vendors',
    payload: {
      customerId: 'cust_9921',
      panNumber: 'ABCDE1234F',
      name: 'Rahul Sharma',
    },
    failoverHistory: [
      {
        vendor: 'Vendor A',
        reason: 'Vendor processed the request successfully',
        latencyMs: 118,
        status: 'success',
      },
    ],
    latencyMs: 118,
    finalStatus: 'SUCCESS',
  },
  {
    requestId: randomUUID(),
    timestamp: new Date(Date.now() - 1000 * 60 * 35),
    capability: 'OCR',
    selectedVendor: 'Vendor C',
    routingStrategy: 'failover',
    routingReason: 'Selected as fallback after top-priority vendors were skipped or failed',
    payload: {
      customerId: 'cust_1122',
      imageUrl: 'https://example.com/id-cards/passport-front.jpg',
      documentType: 'PASSPORT',
    },
    failoverHistory: [
      {
        vendor: 'Vendor E',
        reason: 'Vendor is marked inactive (manually disabled)',
        latencyMs: 0,
        status: 'skipped',
      },
      {
        vendor: 'Vendor A',
        reason: 'Simulated network timeout (> 2000ms)',
        latencyMs: 2001,
        status: 'timeout',
      },
      {
        vendor: 'Vendor C',
        reason: 'Vendor processed the request successfully',
        latencyMs: 310,
        status: 'success',
      },
    ],
    latencyMs: 2311,
    finalStatus: 'SUCCESS',
  },
  {
    requestId: randomUUID(),
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    capability: 'SMS',
    selectedVendor: 'Vendor C',
    routingStrategy: 'lowestCost',
    routingReason: 'Lowest cost per request ($0.02) among eligible vendors',
    payload: {
      customerId: 'cust_3344',
      phoneNumber: '+919876543210',
      message: 'Your verification OTP is 482913. Do not share this with anyone.',
    },
    failoverHistory: [
      {
        vendor: 'Vendor C',
        reason: 'Vendor processed the request successfully',
        latencyMs: 285,
        status: 'success',
      },
    ],
    latencyMs: 285,
    finalStatus: 'SUCCESS',
  },
  {
    requestId: randomUUID(),
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    capability: 'PAYMENT_PROCESSING',
    selectedVendor: 'Vendor B',
    routingStrategy: 'weighted',
    routingReason: 'Selected via weighted random selection (weight=30)',
    payload: {
      customerId: 'cust_7788',
      amount: 2500,
      currency: 'INR',
      merchantId: 'merch_signzy_01',
    },
    failoverHistory: [
      {
        vendor: 'Vendor B',
        reason: 'Vendor processed the request successfully',
        latencyMs: 185,
        status: 'success',
      },
    ],
    latencyMs: 185,
    finalStatus: 'SUCCESS',
  },
  {
    requestId: randomUUID(),
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    capability: 'DOCUMENT_VALIDATION',
    selectedVendor: 'Vendor B',
    routingStrategy: 'lowestLatency',
    routingReason: 'Lowest current latency (185ms) among eligible vendors',
    payload: {
      customerId: 'cust_5566',
      documentUrl: 'https://example.com/contracts/agreement-v2.pdf',
      documentType: 'CONTRACT',
    },
    failoverHistory: [
      {
        vendor: 'Vendor B',
        reason: 'Vendor processed the request successfully',
        latencyMs: 185,
        status: 'success',
      },
    ],
    latencyMs: 185,
    finalStatus: 'SUCCESS',
  },
  {
    requestId: randomUUID(),
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    capability: 'SMS',
    selectedVendor: 'Vendor A',
    routingStrategy: 'roundRobin',
    routingReason: 'Selected via round-robin rotation',
    payload: {
      customerId: 'cust_8899',
      phoneNumber: '+919811223344',
      message: 'Your login verification alert from Signzy.',
    },
    failoverHistory: [
      {
        vendor: 'Vendor A',
        reason: 'Vendor processed the request successfully',
        latencyMs: 120,
        status: 'success',
      },
    ],
    latencyMs: 120,
    finalStatus: 'SUCCESS',
  },
  {
    requestId: randomUUID(),
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    capability: 'PAN_VERIFICATION',
    selectedVendor: 'Vendor A',
    routingStrategy: 'featureBased',
    routingReason: 'Supports the broadest feature set (3 feature(s)) among eligible vendors',
    payload: {
      customerId: 'cust_4433',
      panNumber: 'ABCDE9876F',
      name: 'Anita Desai',
    },
    failoverHistory: [
      {
        vendor: 'Vendor A',
        reason: 'Vendor processed the request successfully',
        latencyMs: 115,
        status: 'success',
      },
    ],
    latencyMs: 115,
    finalStatus: 'SUCCESS',
  },
  {
    requestId: randomUUID(),
    timestamp: new Date(Date.now() - 1000 * 60 * 360),
    capability: 'PAYMENT_PROCESSING',
    selectedVendor: 'Vendor C',
    routingStrategy: 'healthBased',
    routingReason: 'Best health score (successRate=99%, availability=100%) among eligible vendors',
    payload: {
      customerId: 'cust_2211',
      amount: 15000,
      currency: 'INR',
      merchantId: 'merch_signzy_02',
    },
    failoverHistory: [
      {
        vendor: 'Vendor C',
        reason: 'Vendor processed the request successfully',
        latencyMs: 310,
        status: 'success',
      },
    ],
    latencyMs: 310,
    finalStatus: 'SUCCESS',
  },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB.');

    console.log('Removing all existing vendors, routing configs, and logs...');
    await Promise.all([
      Vendor.deleteMany({}),
      RoutingConfig.deleteMany({}),
      RoutingLog.deleteMany({}),
    ]);
    console.log('All previous data wiped clean.');

    console.log('Seeding new glitch-free sample data...');
    const [vendors, configs, logs] = await Promise.all([
      Vendor.insertMany(sampleVendors),
      RoutingConfig.insertMany(sampleConfigs),
      RoutingLog.insertMany(sampleLogs),
    ]);

    console.log(`Successfully seeded:`);
    console.log(` - ${vendors.length} Vendors (with rich pre-computed metrics)`);
    console.log(` - ${configs.length} AI Routing Rules`);
    console.log(` - ${logs.length} Routing Audit Logs (with full request payloads)`);

    await mongoose.connection.close();
    console.log('Database connection closed. Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
