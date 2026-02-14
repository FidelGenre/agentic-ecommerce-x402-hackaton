#!/bin/bash
# 🦈 Shark.Buy ACP Seller Runtime Wrapper
# This script handles paths with spaces better than direct Node.js spawn on Windows.

echo "[$(date)] Starting Shark.Buy Seller Runtime..."
npx tsx src/seller/runtime/seller.ts
