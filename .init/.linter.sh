#!/bin/bash
cd /home/kavia/workspace/code-generation/delivery-manager-dashboard-210123-210137/delivery_frontend_dashboard
npm run lint
ESLINT_EXIT_CODE=$?
npm run build
BUILD_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
   exit 1
fi

