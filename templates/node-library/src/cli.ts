#!/usr/bin/env node

import { hello } from "./index.js";

const args = process.argv.slice(2);
const name = args[0] || "World";

console.log(hello(name));