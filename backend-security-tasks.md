# Backend Security Tasks - Wufi Storefront

## Context
This document outlines critical security vulnerabilities identified in the Wufi pet e-commerce storefront that require backend implementation. The frontend team has identified these issues through a comprehensive security audit of the checkout flow and cart functionality.

## 🔥 Critical Priority Tasks

### 1. Payment Intent Ownership Validation
**Issue**: Payment intents can potentially be completed by unauthorized users
**Current Risk**: HIGH - Could lead to unauthorized order completion

**Required Implementation**:
```typescript
// In your payment completion endpoint
export async function completeStripePaymentFlow(cartId: string, paymentIntentId: string, userId?: string) {
  // Add validation that the payment intent belongs to the current user/cart
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  const cart = await getCart(cartId)
  
  // Validate ownership
  if (cart.customer_id !== userId || 
      paymentIntent.metadata.cart_id !== cartId ||
      paymentIntent.metadata.customer_id !== userId) {
    throw new Error("Unauthorized payment intent access")
  }
  
  // Continue with payment completion...
}
```

**Frontend Context**: Currently in `src/lib/data/cart.ts` lines 396-442, the `completeStripePaymentFlow` function lacks ownership validation.

### 2. CSRF Protection Implementation
**Issue**: All server actions lack CSRF protection
**Current Risk**: HIGH - Vulnerable to Cross-Site Request Forgery

**Required Implementation**:
- Implement CSRF token generation and validation middleware
- Add CSRF tokens to all state-changing endpoints
- Validate CSRF tokens on cart operations, checkout, and authentication

**Affected Endpoints**:
- Cart updates (`/store/carts/{id}`)
- Line item modifications
- Address updates 
- Payment session initiation
- Order completion

**Frontend Context**: Server actions in `src/modules/cart/actions.ts` and checkout components need CSRF protection.

### 3. JWT Token Security Enhancement
**Issue**: JWT tokens have 7-day expiration with no refresh mechanism
**Current Risk**: MEDIUM-HIGH - Extended exposure window if compromised

**Required Implementation**:
```typescript
// Implement shorter access tokens (15-30 minutes) with refresh tokens
const ACCESS_TOKEN_EXPIRY = 30 * 60 // 30 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 // 7 days

// Add refresh token rotation
export async function refreshAccessToken(refreshToken: string) {
  // Validate refresh token
  // Issue new access token
  // Optionally rotate refresh token
}
```

**Frontend Context**: Token management in `src/lib/data/cookies.ts` currently sets 7-day expiration.

### 4. Server-Side Business Rule Validation
**Issue**: Critical business logic enforced only on frontend
**Current Risk**: MEDIUM-HIGH - Business rules can be bypassed

**Required Implementation**:
- Validate address requirements based on customer type and order value
- Enforce shipping method restrictions
- Validate subscription eligibility
- Implement order minimum/maximum validation

**Frontend Context**: Business rules in `src/lib/util/checkout-helpers.ts` need server-side enforcement.

## 🚨 High Priority Tasks

### 5. Rate Limiting Implementation
**Issue**: No rate limiting on critical operations
**Current Risk**: MEDIUM - Vulnerable to automated attacks

**Required Implementation**:
- Cart operations: 100 requests per minute per IP
- Checkout operations: 10 attempts per minute per user
- Authentication: 5 attempts per minute per IP
- Payment processing: 3 attempts per minute per user

**Affected Endpoints**:
- `/store/carts/*`
- `/store/auth/*` 
- `/store/payment/*`
- Order completion endpoints

### 6. Enhanced Authentication Validation
**Issue**: Weak session validation and potential session hijacking
**Current Risk**: MEDIUM

**Required Implementation**:
- Implement session fingerprinting
- Add IP address validation
- Implement concurrent session limits
- Add suspicious activity detection

### 7. Server-Side Input Validation
**Issue**: Reliance on frontend validation only
**Current Risk**: MEDIUM

**Required Implementation**:
- Validate all input data on server side
- Implement proper data sanitization
- Add input length constraints
- Validate data types and formats

## 🔧 Medium Priority Tasks

### 8. Audit Logging
**Issue**: No security audit trail
**Required Implementation**:
- Log all authentication events
- Log payment operations
- Log administrative actions
- Implement log monitoring and alerting

### 9. Database Security
**Issue**: Potential SQL injection and data exposure
**Required Implementation**:
- Review all database queries for injection vulnerabilities
- Implement proper parameterized queries
- Add database access logging
- Implement database connection security

### 10. API Security Headers
**Issue**: Missing security headers on API responses
**Required Implementation**:
```typescript
// Add security headers to all API responses
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  // Add other security headers
  next()
})
```

## 📋 Implementation Priority

1. **Week 1**: Payment intent validation + CSRF protection
2. **Week 2**: JWT token enhancement + Rate limiting  
3. **Week 3**: Server-side validation + Authentication improvements
4. **Week 4**: Audit logging + Additional security measures

## 🧪 Testing Requirements

For each implementation:
- Unit tests for security functions
- Integration tests for authentication flows
- Load testing for rate limiting
- Security testing for injection vulnerabilities
- Manual penetration testing

## 📞 Coordination with Frontend

The frontend team will:
- Implement client-side complementary measures
- Update API calls to include CSRF tokens
- Handle new authentication flows
- Implement proper error handling for new security measures

## 📋 Required Reporting After Backend Implementation

**IMPORTANT**: After completing each task, the backend agent must provide the following information to enable frontend coordination:

### 1. Payment Intent Validation (Critical)
**Report Back**:
- [ ] New error codes/messages for unauthorized payment access
- [ ] Any changes to `completeStripePaymentFlow` function signature
- [ ] Updated payment metadata requirements
- [ ] New validation error response format
- [ ] Testing results for ownership validation edge cases

### 2. CSRF Protection (Critical)  
**Report Back**:
- [ ] CSRF token endpoint URL and format
- [ ] Token header name and format required (e.g., `X-CSRF-Token`)
- [ ] Token expiration and refresh mechanism
- [ ] List of all endpoints requiring CSRF tokens
- [ ] Error response format for invalid/missing CSRF tokens
- [ ] Integration example for cart operations

### 3. JWT Token Enhancement (Critical)
**Report Back**:
- [ ] New access token expiration time (15-30 minutes)
- [ ] Refresh token endpoint URL and payload format
- [ ] Token rotation mechanism details
- [ ] Updated cookie settings and security flags
- [ ] Error codes for expired/invalid tokens
- [ ] Frontend token refresh implementation requirements

### 4. Server-Side Business Rule Validation (Critical)
**Report Back**:
- [ ] List of business rules now enforced server-side
- [ ] New validation error messages and codes
- [ ] Any changes to checkout flow API responses
- [ ] Updated address validation requirements
- [ ] Shipping method restriction details

### 5. Rate Limiting (High Priority)
**Report Back**:
- [ ] Exact rate limits implemented per endpoint
- [ ] Rate limit header names (e.g., `X-RateLimit-Remaining`)
- [ ] Rate limit exceeded error response format
- [ ] Any client-side rate limit adjustments needed
- [ ] Retry-After header implementation details

### 6. Enhanced Authentication (High Priority)
**Report Back**:
- [ ] New session validation requirements
- [ ] IP address validation implementation details
- [ ] Concurrent session limit behavior
- [ ] Suspicious activity detection triggers
- [ ] Any new authentication headers required

### 7. Input Validation (High Priority)
**Report Back**:
- [ ] Updated validation rules and constraints
- [ ] New field length limits
- [ ] Changed data format requirements
- [ ] Server-side sanitization implementation
- [ ] Validation error message formats

### 8. Security Headers (Medium Priority)
**Report Back**:
- [ ] Complete list of security headers added
- [ ] Any CSP (Content Security Policy) requirements
- [ ] CORS policy changes
- [ ] Headers that might affect frontend functionality

### 9. API Changes & New Endpoints
**Report Back**:
- [ ] Any modified endpoint URLs or methods
- [ ] New required headers for existing endpoints
- [ ] Changed request/response payload formats
- [ ] New authentication requirements for existing endpoints
- [ ] Deprecated endpoints or functionality

### 10. Error Handling Updates
**Report Back**:
- [ ] New error code mappings and meanings
- [ ] Updated error response structure
- [ ] Security-related error messages in Estonian (per user preference)
- [ ] Error scenarios requiring specific frontend handling

### 11. Testing & Performance Impact
**Report Back**:
- [ ] Performance impact of new security measures
- [ ] Any timeout adjustments needed for frontend
- [ ] Load testing results affecting frontend behavior
- [ ] Browser compatibility issues with new security features

### 12. Configuration Requirements
**Report Back**:
- [ ] Environment variables needed for frontend
- [ ] Updated CORS configurations
- [ ] New cookie settings or domain requirements
- [ ] SSL/TLS certificate requirements

## 📝 Reporting Template

For each completed task, use this template:

```markdown
## Task Completed: [Task Name]

### Implementation Summary
- [Brief description of what was implemented]

### Frontend Integration Required
- [ ] API changes: [details]
- [ ] New headers required: [details]  
- [ ] Error handling updates: [details]
- [ ] Configuration changes: [details]

### Testing Results
- [Any issues or considerations for frontend]

### Next Steps for Frontend
- [Specific actions frontend team needs to take]
```

## 🔍 Monitoring Requirements

Implement monitoring for:
- Failed authentication attempts
- Rate limit violations  
- Payment processing anomalies
- Suspicious user behavior patterns
- API error rates and response times

Please prioritize these tasks based on your current sprint capacity and let the frontend team know which items you'll tackle first so we can coordinate our efforts. 