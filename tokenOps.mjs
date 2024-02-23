import crypto from 'crypto';
// import { keccak256 } from 'js-sha3';
import pkg from 'js-sha3';
const { keccak256 } = pkg;

export function generateAccessToken() {
    return crypto.randomBytes(16).toString('hex'); //32
}

export function hashToken(token) {
    return keccak256(token);
}





