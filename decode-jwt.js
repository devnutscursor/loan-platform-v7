#!/usr/bin/env node

// JWT Token Decoder for Optimal Blue
// Run with: node decode-jwt.js

function decodeJWT(token) {
  try {
    // Split the JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = Buffer.from(paddedPayload, 'base64').toString('utf8');
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error.message);
    return null;
  }
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toISOString();
}

// Your Bearer token
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSIsImtpZCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSJ9.eyJhdWQiOiJodHRwczovL21hcmtldHBsYWNlYXV0aC5vcHRpbWFsYmx1ZS5jb20vZDM1YWU4OTMtMjM2Ny00MGI1LWE5YjQtYmZhYjNhY2I3OTkxIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvZDAwMjZmOTktYjk4Mi00NzI0LTgyYzUtZWUwMTRmNWI2MzE4LyIsImlhdCI6MTc1NzQyMDYwMiwibmJmIjoxNzU3NDIwNjAyLCJleHAiOjE3NTc0MjQ1MDIsImFpbyI6ImsyUmdZREM4Kys5MXdJOUZGeWR1M0xncGRKblZUd0E9IiwiYXBwaWQiOiJhNjFmYjhiOS0yNzgxLTQ5MGItYWIxYy0yNjg3NDE5ZmUzZWYiLCJhcHBpZGFjciI6IjEiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9kMDAyNmY5OS1iOTgyLTQ3MjQtODJjNS1lZTAxNGY1YjYzMTgvIiwib2lkIjoiOTYzN2Y4NjktZDgxNi00MjVjLWIzZjctNGVhZDk2MGU2NmMyIiwicmgiOiIxLkFSc0FtVzhDMElLNUpFZUN4ZTRCVDF0akdBeVpHSlBEaEsxQWtaVjhyQXN6a2p2WUFBQWJBQS4iLCJyb2xlcyI6WyJMb2NrRGVza01hbmFnZW1lbnQiLCJNYXJrZXRwbGFjZS5TdXBwb3J0LlNlcnZpY2VzIiwiTWFya2V0cGxhY2UuTG9hbi5IaXN0b3JpY2FsUmVzZWFyY2giLCJCdXNpbmVzc0FuYWx5dGljcy5NYXJrZXRSYXRlSW5kZXgiLCJDbGllbnRJZFNlcnZpY2UiLCJDb21lcmdlbmNlLkNvbmNpZXJnZVByb3NwZWN0cyIsIkJlc3RYTUlTZWFyY2hGcm9tTG9hbiIsIkhpZXJhcmNoeU1hbmFnZW1lbnRTZXJ2aWNlIiwiQ29tZXJnZW5jZS5Db25jaWVyZ0NvbnRhY3RzIiwiQ29tZXJnZW5jZS5JbmRpdmlkdWFsUmV2aWV3V2lkZ2V0QVBJIiwiTWFya2V0cGxhY2UuTG9hbi5BZG1pbmlzdHJhdGlvbiIsIkJlc3RYTUlTZWFyY2giLCJNYXJrZXRwbGFjZS5QcmljaW5nLkNvbnN1bWVyIiwiQmFzZVByaWNpbmciLCJBdXRob3JpemF0aW9uU2VydmljZSIsIk1hcmtldHBsYWNlLlByaWNpbmcuQnJva2VyIiwiTWFya2V0cGxhY2UuQXV0b1F1b3RlIiwiTWFya2V0cGxhY2UuTG9hbi5Mb2NraW5nIiwiQ29tZXJnZW5jZS5SZXZpZXdzQVBJIiwiTWFya2V0cGxhY2UuTG9hbi5DaGFuZ2VSZXF1ZXN0IiwiTWFya2V0cGxhY2UuQ29uZmlndXJhdGlvbi5TdXBwb3J0IiwiTWFya2V0cGxhY2UuUHJpY2luZy5GdWxsIiwiQ29tZXJnZW5jZS5RdWVzdGlvbm5haXJlIiwiQ29tZXJnZW5jZS5DdXN0b21lclRQT0RhdGEiLCJNYXJrZXRwbGFjZS5NYXJrZXRSYXRlSW5kZXguSW50cmFkYXkiLCJJbnRlcm5hbC5JbnZlc3RvclByaWNpbmdJbnNpZ2h0Q29uZmlnIiwiTWFya2V0cGxhY2UuTG9hblNpZnRlck5vdy5TZWFyY2giLCJNYXJrZXRwbGFjZS5Mb2FuU2lmdGVyTm93LlBpcGVsaW5lIiwiTWFya2V0cGxhY2UuTG9hblNpZnRlck5vdy5Db25maWd1cmF0aW9uIiwiSW50ZXJuYWwuSWRlbnRpdHlNYW5hZ2VtZW50U2VydmljZSIsIkludGVybmFsLkludmVzdG9yTWFuYWdlbWVudCJdLCJzdWIiOiI5NjM3Zjg2OS1kODE2LTQyNWMtYjNmNy00ZWFkOTYwZTY2YzIiLCJ0aWQiOiJkMDAyNmY5OS1iOTgyLTQ3MjQtODJjNS1lZTAxNGY1YjYzMTgiLCJ1dGkiOiJtQzVXV0FmN1FVeWV6cjVSbzNoN0FBIiwidmVyIjoiMS4wIiwieG1zX2Z0ZCI6Ikh3S2U1MVN5TlVzOVdCTWhWbHV1dG5hM1NMTVRQdmN3aGNYTF9kZGV6ZW9CZEhOdWIzSjBhQzFrYzIxeiJ9.R3_NtNHZ-Me8VJfiuFbyFQDFge_PcCp6xdA63_ckIQgiSp8CAYKdtiy1EGQAS1AUzyxHb5zZsr_gLU41miz5r3rnGU8tjTzhzdfDSloTXmQ-BgA74k2KVJPu-oxtDROgM3XgiI91pdxkr8hobKIRhkJkLH1GSytS8hvVGtfSd0yhnuBinmXjYHJVtGE838MfnBA-0NRQt0nZexcsVRD4W1JTrqS8NsZlSiE7euN25d_G7TJF44dIRDzzSkG_eV_36yQKEYshCWOS7VJJZKgBoBqho4B4Jg1W_sGxnH8c1-RdHe7Xx5SgogvwtazdBLqs7pWrTRVp_fu6OfGF5maN6A";

console.log('🔍 Decoding Optimal Blue JWT Token...\n');

const payload = decodeJWT(token);

if (payload) {
  console.log('📋 Token Information:');
  console.log(`   Issued At: ${formatDate(payload.iat)}`);
  console.log(`   Expires At: ${formatDate(payload.exp)}`);
  console.log(`   Not Before: ${formatDate(payload.nbf)}`);
  console.log(`   Audience: ${payload.aud}`);
  console.log(`   Issuer: ${payload.iss}`);
  console.log(`   App ID: ${payload.appid}`);
  console.log(`   Object ID: ${payload.oid}`);
  console.log(`   Tenant ID: ${payload.tid}`);
  console.log('');
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  const isExpired = now > payload.exp;
  
  console.log('⏰ Token Status:');
  console.log(`   Current Time: ${formatDate(now)}`);
  console.log(`   Token Expired: ${isExpired ? '❌ YES' : '✅ NO'}`);
  
  if (isExpired) {
    console.log(`   Expired ${Math.floor((now - payload.exp) / 3600)} hours ago`);
    console.log('');
    console.log('💡 Solution:');
    console.log('   1. Go back to Optimal Blue Digital Marketplace');
    console.log('   2. Generate a new Bearer token');
    console.log('   3. Update your .env.local file with the new token');
  } else {
    console.log(`   Valid for ${Math.floor((payload.exp - now) / 3600)} more hours`);
  }
  
  console.log('');
  console.log('🔑 Available Roles:');
  payload.roles.forEach((role, index) => {
    console.log(`   ${index + 1}. ${role}`);
  });
} else {
  console.log('❌ Failed to decode JWT token');
}
