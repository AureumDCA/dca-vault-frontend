# Security Policy

## Scope

This repo is the Next.js frontend for AureumDCA. It connects to
users' Freighter wallets and interacts with `dca-vault-contract` on
**Stellar Testnet only**. The frontend itself never has access to
private keys — all signing happens inside the Freighter extension.

## Reporting a Vulnerability

If you discover a security vulnerability — including issues that
could trick a user into signing an unintended transaction, XSS,
exposure of sensitive data, or incorrect transaction construction —
please report it privately rather than opening a public GitHub
issue.

**To report:** email douglasfrancis054@gmail.com with a clear
description of the vulnerability, steps to reproduce if applicable,
and its potential impact.

Please do not disclose the vulnerability publicly until it has
been reviewed and, if valid, addressed.

## What to expect

- We aim to acknowledge reports within 5 business days.
- We will keep you updated as we investigate and work on a fix.
- We're happy to credit reporters in the fix's commit message or
  release notes, unless you prefer to remain anonymous.

## Out of scope

- Issues already tracked in open GitHub issues
- Purely theoretical vulnerabilities with no demonstrated impact
- Issues in third-party dependencies (report those to the
  respective maintainers; we will still appreciate a heads-up)
