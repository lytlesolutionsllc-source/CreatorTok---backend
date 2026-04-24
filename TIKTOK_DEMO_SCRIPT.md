# TikTok App Review — Demo Video Script

This document provides a step-by-step script for recording the screen-capture video required by TikTok when you submit your developer app for review. TikTok requires you to demonstrate **every permission/scope** your app requests.

---

## Before You Record

- [ ] Your frontend is deployed and accessible (e.g., `https://your-app.vercel.app`).
- [ ] Your backend is deployed with the TikTok OAuth environment variables set:
  - `TIKTOK_CLIENT_KEY`
  - `TIKTOK_CLIENT_SECRET`
  - `TIKTOK_REDIRECT_URI` (must match what you registered in the TikTok developer portal)
  - `FRONTEND_URL`
- [ ] You have a **real TikTok account** to use as the test account.
- [ ] Your screen recording software is ready (OBS, QuickTime, Loom, etc.).
- [ ] Set your browser to a clean profile and resolution of at least 1280 × 720.
- [ ] The video should be **unedited** and show the complete flow from start to finish.

---

## Recording Script

### Scene 1 — Show the Landing / Login Page (0:00 – 0:30)

1. Open your browser and navigate to `https://your-app.vercel.app`.
2. **Speak (or show a title card):** *"This is CreatorTok — a TikTok content scheduling platform."*
3. The login/register page is displayed. Show it briefly so reviewers can see the app name and branding.

---

### Scene 2 — Register or Log In to CreatorTok (0:30 – 1:00)

1. Click **Sign Up / Register** (or **Log In** if you already have an account).
2. Fill in your email address, password, and display name.
3. Click **Register** (or **Log In**).
4. You are redirected to the **Dashboard** home page. Show the dashboard briefly.

---

### Scene 3 — Navigate to "Accounts" and Connect a TikTok Account (1:00 – 2:30)

1. In the sidebar, click **Accounts** (or "Connect Accounts").
2. The Accounts page loads. Currently no accounts are connected.
3. Click the **Connect TikTok Account** button (or "Add Account" → "Sign in with TikTok").
4. **What happens next:** The browser sends a request to `GET /api/tiktok/login` on the backend, which redirects you to TikTok's official OAuth consent screen.

---

### Scene 4 — TikTok Consent Screen (2:30 – 3:30)

1. The browser is now on `https://www.tiktok.com/v2/auth/authorize/…`.
2. **Show the full URL in the address bar** so reviewers can see this is the official TikTok login page.
3. Log in with your TikTok credentials (email/phone + password, or QR code).
4. TikTok displays the **consent screen** listing the permissions your app is requesting:
   - `user.info.basic` — Read your basic profile info (open ID, avatar)
   - `user.info.profile` — Read your profile info (username, display name)
   - `user.info.stats` — Read your follower/following counts
   - `video.list` — Read your video list
5. **Speak (or show a title card):** *"The user reviews the requested permissions."*
6. Click **Authorize** to grant the permissions.

---

### Scene 5 — Return to CreatorTok Dashboard (3:30 – 4:30)

1. TikTok redirects the browser back to your backend callback URL (`/api/tiktok/callback`), which in turn redirects to `https://your-app.vercel.app/dashboard/accounts?success=true`.
2. The **Accounts** page now shows the newly connected TikTok account with:
   - Profile avatar
   - Display name / username
   - Follower count
3. **Speak (or show a title card):** *"The TikTok account is now connected and the profile data has been saved."*
4. Pan the camera/recording slowly over the account card to ensure all details are clearly visible.

---

### Scene 6 — Create and Schedule a Post (4:30 – 6:00)

> This section demonstrates the `video.list` scope in context and shows how the app uses the connected account.

1. Click **+ New Post** on the dashboard.
2. In the modal that opens:
   - Select the connected TikTok account from the dropdown.
   - Enter a sample caption: *"My first scheduled post! #CreatorTok #TikTok"*
   - Pick a scheduled date/time (e.g., tomorrow at 10:00 AM).
3. Click **Schedule**.
4. The post appears in the **Scheduled Posts** list with status **SCHEDULED**.
5. **Speak (or show a title card):** *"Posts can now be scheduled to the connected TikTok account."*

---

### Scene 7 — Disconnect / Show Data Deletion (6:00 – 6:30)

1. Return to the **Accounts** page.
2. Click the **Disconnect** (delete) button next to the TikTok account.
3. Confirm the action.
4. The account is removed from the list.
5. **Speak (or show a title card):** *"Users can disconnect their TikTok account at any time, which removes all stored tokens from our database."*

---

### Scene 8 — Closing (6:30 – 7:00)

1. Navigate back to the dashboard home page.
2. **Speak (or show a title card):** *"This concludes the CreatorTok app demonstration for TikTok API review."*
3. Stop the recording.

---

## Tips for a Successful Review

- Keep the video **under 10 minutes** and ideally between 5–7 minutes.
- Make sure **the full URL bar is visible** whenever you are on a TikTok page.
- Do **not** speed up, cut, or edit the OAuth / consent screen portion of the video.
- Upload the video as an `.mp4` file (H.264, 1280×720 or higher).
- If TikTok asks for a "Privacy Policy URL", make sure you have a hosted privacy policy page before submitting.
- If your app is still in **Sandbox** mode, only your registered test users will be able to complete the OAuth flow. Add your TikTok test account email in the TikTok developer portal under **Manage App → Sandbox → Test Users** before recording.

---

## Permissions Justification (for the Review Form)

When filling out the TikTok app review form, use the following justifications:

| Scope | Justification |
|-------|--------------|
| `user.info.basic` | Required to identify the TikTok account uniquely (open_id) and display the user's avatar on their connected accounts dashboard. |
| `user.info.profile` | Required to display the TikTok username and display name on the connected accounts dashboard so the user can recognise which account is linked. |
| `user.info.stats` | Required to display the follower count on the accounts dashboard, giving creators visibility into their audience size for each connected account. |
| `video.list` | Required to list the creator's existing TikTok videos so they can reference past content when drafting new posts and avoid duplicate uploads. |

---

## Environment Variable Checklist

Before going live, ensure these are set in your Vercel / hosting environment:

```
TIKTOK_CLIENT_KEY=<from TikTok developer portal>
TIKTOK_CLIENT_SECRET=<from TikTok developer portal>
TIKTOK_REDIRECT_URI=https://<your-backend-domain>/api/tiktok/callback
FRONTEND_URL=https://<your-frontend-domain>
```

The `TIKTOK_REDIRECT_URI` must be **exactly** the same as the one registered in the TikTok developer portal under **Manage App → Login Kit → Redirect URI**.
