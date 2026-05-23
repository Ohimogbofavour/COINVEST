# Coinvest Security Specification

## 1. Data Invariants
- An investor's balance, profits, or active portfolios cannot be accessed, read, or modified by any other participant.
- All transactions, investments, and trades are sub-resources bound to a specific user's `userId`. Write operations must match the authenticated `request.auth.uid`.
- Timestamps must correspond to structured format limits. All numeric properties (e.g., amount, balance) must be validated as standard numbers.

## 2. The "Dirty Dozen" Attack Payloads (PERMISSION_DENIED expected)
1. **Identity Spoofing (Create User Profile as Another UID)**: Attempt to create a user document under `/users/attacker_uid` where `id` or auth credentials references `"victim_uid"`.
2. **Balance Arbitrary Inflation**: Attempt to write an update to `/users/user_id` increasing the balance to `$9,999,999` directly from client SDK.
3. **Ghost Collection Write**: Attacker writing transactions directly to `/users/victim_id/transactions/tx_1` spoofing completed stats.
4. **Unauthorized Deposit Inject**: Client writes transaction with type `'deposit'` and state `'completed'` to balance check.
5. **PII Blanket Scraping**: Attacker runs a collection query on `/users` to grab other participants' emails and names.
6. **Negative Margin Open**: Writing negative amount trades `/users/id/trades/trade_1` containing negative dollars to drain liquidity.
7. **Leverage Overflow Poisoning**: Writing trades with leverage `999999x` to overflow calculations.
8. **Staking Date Cheat**: Writing investments where the end date is prior to the start date or duration is negative.
9. **Unauthenticated Read**: Attempting to query paths without an active Firebase Auth token.
10. **Arbitrary Write Key shadow**: Direct document creation inside `/users/{userId}` injecting malicious field variables.
11. **Verification Status Bypass**: Client writes update setting `verificationStatus` directly to `"verified"` to spoof AML clearances.
12. **Id Poisoning Injection**: Attempting to write a subcollection item with a document ID of 1MB junk characters to exhaust Firestore lookup metrics.

## 3. Test Runner Structural Blueprint
The `firestore.rules.test.ts` describes standard client-side simulations utilizing `@firebase/rules-unit-testing` to assure complete isolation. Each test payload strictly asserts `assertFails()` context for any non-compliance.
