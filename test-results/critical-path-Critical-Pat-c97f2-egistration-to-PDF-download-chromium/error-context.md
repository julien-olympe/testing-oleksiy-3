# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Register" [level=2] [ref=e4]
  - generic [ref=e5]: Registration failed. Please try again.
  - generic [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]: Username
      - textbox "Username" [ref=e9]: test_user_critical_1763455090190
    - generic [ref=e10]:
      - generic [ref=e11]: Email
      - textbox "Email" [ref=e12]: test_critical_1763455090190@example.com
    - generic [ref=e13]:
      - generic [ref=e14]: Password
      - textbox "Password" [ref=e15]: TestPassword123!
    - generic [ref=e16]:
      - generic [ref=e17]: Confirm Password
      - textbox "Confirm Password" [ref=e18]: TestPassword123!
    - button "Register" [ref=e19] [cursor=pointer]
  - paragraph [ref=e20]:
    - text: Already have an account?
    - link "Login" [ref=e21] [cursor=pointer]:
      - /url: /login
```