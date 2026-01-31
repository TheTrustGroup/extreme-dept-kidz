# Running the dev server and loading in the browser

## Port 3000 already in use?

If you see **`EADDRINUSE: address already in use :::3000`**:

**Option A – Use the next port**  
Do nothing: Next.js will try 3001, 3002, etc. and print the URL (e.g. `Local: http://localhost:3001`). Open that URL in your browser.

**Option B – Free port 3000 (Mac/Linux)**  
In a terminal:
```bash
lsof -i :3000
```
Note the **PID** (first number) of the process using 3000, then:
```bash
kill <PID>
```
Example: `kill 12345`. Then run `npm run dev` again.

## Quick steps

1. **Start the server** (in a terminal):
   ```bash
   npm run dev
   ```

2. **Wait until you see** something like:
   ```
   ✓ Ready in 3.2s
   ▲ Next.js 14.2.35
   - Local: http://localhost:3000
   ```
   The first start can take 10–30 seconds. Don’t open the browser until you see `Ready`.

3. **Open the app in your browser:**
   - **Mac:** In a *second* terminal run: `npm run dev:open`  
     Or manually open: **http://localhost:3000**
   - **Windows:** Open Chrome/Edge and go to **http://localhost:3000**
   - **Linux:** Run `xdg-open http://localhost:3000` or go to **http://localhost:3000** in your browser.

4. The first page load can take a few seconds while Next.js compiles. If the tab stays blank, wait 5–10 seconds and refresh once.

## If the app doesn’t load

- **“Port 3000 is in use”**  
  Another app is using port 3000. Either:
  - Quit the other app (or the other terminal where you ran `npm run dev`), then run `npm run dev` again, or
  - Use the port Next suggests (e.g. 3001) and open `http://localhost:3001` instead.

- **Page stays blank or loading**  
  1. Make sure the terminal shows `✓ Ready` before you open the URL.  
  2. Wait 5–10 seconds after opening the URL (first compile is slow).  
  3. Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows).

- **“This site can’t be reached”**  
  The dev server isn’t running. In the project folder run `npm run dev` and wait for `Ready`, then try the URL again.

## Fixed port

The dev script uses port **3000** so the URL is always **http://localhost:3000** (unless that port is in use; then Next.js will print the port it chose).
