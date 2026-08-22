# Security Specification: Solman Hussain Choudhury Portfolio & CMS

## 1. Data Invariants
- Only verified administrator `solmanchoudhury66@gmail.com` can create, update, or delete articles, gallery items, and profile settings.
- Anyone can read published articles, gallery items, and public profile data.
- Anyone can submit a consultation or contact inquiry with valid input constraints (name, phone, message).
- Inquiries can only be read, updated (status changed), or deleted by the authorized administrator `solmanchoudhury66@gmail.com`.
- Document IDs must match the `isValidId` regex `^[a-zA-Z0-9_\\-]+$` and be <= 128 characters.

## 2. The "Dirty Dozen" Payloads (Must be rejected with PERMISSION_DENIED)
1. **Unauthenticated Article Creation**: Anonymous user attempting to POST to `/articles/art-999`.
2. **Unauthorized Email Article Creation**: Authenticated user with email `hacker@evil.com` trying to create an article.
3. **Unverified Email Impersonation**: User with email `solmanchoudhury66@gmail.com` but `email_verified == false`.
4. **Oversized String Attack (Denial of Wallet)**: Article title with 50,000 characters.
5. **Junk Path Variable ID Injection**: Document ID with 2KB junk symbols: `/articles/%%%%$$$evil-id-12345`.
6. **Unauthorized Profile Mutation**: Non-admin user attempting to overwrite `/profile/main`.
7. **Public Inquiry Snooping**: Unauthenticated user or unauthorized visitor attempting to read `/inquiries/{inquiryId}`.
8. **Inquiry Status Tampering**: Non-admin attempting to mark client inquiries as `replied` or `archived`.
9. **Inquiry Deletion by Third-Party**: Unauthorized user attempting to delete a client's message.
10. **Gallery Overwrite by Non-Admin**: Attempting to inject spam links into `/gallery/{galleryId}`.
11. **Admin Escalation Injection**: Non-admin attempting to create an entry in `/admins/{uid}`.
12. **Shadow Field Injection**: Adding unapproved arbitrary execution fields to inquiries or articles.

## 3. Test Invariants
- Admin verification relies strictly on `request.auth.token.email.lower() == 'solmanchoudhury66@gmail.com' && request.auth.token.email_verified == true`.
- All writes require type safety and size limits.
