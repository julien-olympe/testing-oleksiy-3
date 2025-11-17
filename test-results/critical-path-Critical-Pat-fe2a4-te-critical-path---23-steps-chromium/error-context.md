# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Register" [level=2] [ref=e4]
  - generic [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: Username
      - textbox "Username" [ref=e8]: test_user_critical_1763392198229
    - generic [ref=e9]:
      - generic [ref=e10]: Email
      - textbox "Email" [ref=e11]: test_critical_1763392198229@example.com
    - generic [ref=e12]:
      - generic [ref=e13]: Password
      - textbox "Password" [ref=e14]: TestPassword123!
    - generic [ref=e15]:
      - generic [ref=e16]: Confirm Password
      - textbox "Confirm Password" [active] [ref=e17]
    - button "Register" [ref=e18] [cursor=pointer]
  - paragraph [ref=e19]:
    - text: Already have an account?
    - link "Login" [ref=e20] [cursor=pointer]:
      - /url: /login
```