# Testing Police Connection Without Real Credentials

## 🎯 Quick Start

The easiest way to get started is to use the interactive helper:

```bash
./test-police-helper.sh
```

This will guide you through:
- ✅ Running automated tests
- ✅ Viewing documentation
- ✅ Checking system status
- ✅ Manual testing steps
- ✅ Quick reference commands

## 🚀 Or Run Tests Directly

```bash
# Make sure services are running
docker-compose up -d

# Run the automated test
./tests/integration/test_police_submission.sh
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[TESTING_SUMMARY.md](docs/TESTING_SUMMARY.md)** | Executive summary and overview |
| **[TESTING_WITHOUT_REAL_CREDENTIALS.md](docs/TESTING_WITHOUT_REAL_CREDENTIALS.md)** | Complete testing guide |
| **[TESTING_QUICK_REFERENCE.md](docs/TESTING_QUICK_REFERENCE.md)** | Quick commands and troubleshooting |

## 🧪 Three Testing Levels

### Level 1: Mock Credentials (Local) 🏠
**Use when**: Daily development, CI/CD
```bash
./tests/integration/test_police_submission.sh
```
- ✅ No real police connection
- ✅ Tests the complete flow
- ✅ Safe for development

### Level 2: Sandbox (Staging) 🧪
**Use when**: Integration testing
- Requires Slovak government sandbox credentials
- Tests real government integration
- Isolated test environment

### Level 3: Test Account (Production) 🔒
**Use when**: Pre-production validation
- Real credentials, isolated account
- Real police system
- Final validation before launch

## 🛠️ What's Included

### Scripts
- **`test-police-helper.sh`** - Interactive testing helper
- **`tests/integration/test_police_submission.sh`** - Automated E2E test

### Documentation
- **`docs/TESTING_SUMMARY.md`** - Overview and getting started
- **`docs/TESTING_WITHOUT_REAL_CREDENTIALS.md`** - Complete guide
- **`docs/TESTING_QUICK_REFERENCE.md`** - Quick commands

### Existing Resources
- **`apps/api-server/tests/test_e2e_flow.js`** - Node.js E2E test
- **`security/gov_fake_private.key`** - Test credentials
- **`docs/ENCRYPTION_TESTING_GUIDE.md`** - Encryption testing

## 🔍 Troubleshooting

### Services not running?
```bash
docker-compose up -d
docker-compose ps
```

### Check logs
```bash
docker logs hostshield_api --tail 50 -f
```

### Test credentials not working?
```bash
# Verify test key exists
ls -la security/gov_fake_private.key

# Check encryption key is set
grep CREDENTIAL_ENCRYPTION_KEY .env
```

## 📖 Next Steps

1. **Start here**: Run `./test-police-helper.sh`
2. **Read**: `docs/TESTING_SUMMARY.md`
3. **Test**: Run automated tests
4. **Learn**: Review the complete guide
5. **Deploy**: Move to sandbox testing when ready

## 🤝 Support

For issues or questions:
1. Check `docs/TESTING_QUICK_REFERENCE.md` for common commands
2. Review `docs/TESTING_WITHOUT_REAL_CREDENTIALS.md` for detailed troubleshooting
3. Check service logs: `docker logs hostshield_api`

---

**Ready to test?** Run: `./test-police-helper.sh`
