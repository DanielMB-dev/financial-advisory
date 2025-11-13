# Page snapshot

```yaml
- generic [ref=e1]:
    - generic [ref=e3]:
        - generic [ref=e4]:
            - generic [ref=e5]: Reset your password
            - generic [ref=e6]: Enter your new password below
        - generic [ref=e8]:
            - generic [ref=e9]:
                - heading "Create new password" [level=2] [ref=e10]
                - paragraph [ref=e11]: Enter a strong password to protect your account
            - generic [ref=e12]:
                - generic [ref=e13]:
                    - generic [ref=e14]: New Password
                    - generic [ref=e15]:
                        - textbox "New Password" [active] [ref=e16]:
                            - /placeholder: ••••••••
                        - button "Show password" [ref=e17]:
                            - img
                - generic [ref=e18]:
                    - generic [ref=e19]: Confirm Password
                    - generic [ref=e20]:
                        - textbox "Confirm Password" [ref=e21]:
                            - /placeholder: ••••••••
                        - button "Show password" [ref=e22]:
                            - img
                - button "Reset password" [ref=e23]
            - paragraph [ref=e24]:
                - link "Back to login" [ref=e25] [cursor=pointer]:
                    - /url: /login
    - region "Notifications alt+T"
    - generic [ref=e26]:
        - img [ref=e28]
        - button "Open Tanstack query devtools" [ref=e76] [cursor=pointer]:
            - img [ref=e77]
    - button "Open Next.js Dev Tools" [ref=e130] [cursor=pointer]:
        - img [ref=e131]
    - alert [ref=e134]
```
