// =============================================================
// DREAM DROP — FIREBASE SYNC ENGINE
// localStorage is ALWAYS the primary store.
// Firebase is a silent background backup — game works without it.
//
// Include this AFTER firebase-config.js and AFTER scriptt.js:
//   <script src="firebase-config.js"></script>
//   <script src="scriptt.js"></script>
//   <script src="firebase-sync.js"></script>
// =============================================================

(function() {

  // Don't do anything if Firebase is not configured
  if (typeof FIREBASE_CONFIG === 'undefined' || !FIREBASE_ENABLED) {
    console.log('[Firebase] Not configured — running localStorage-only mode.');
    return;
  }

  // Check if required Firebase SDK scripts are loaded
  if (typeof firebase === 'undefined') {
    console.warn('[Firebase] Firebase SDK not loaded. Add the SDK scripts to index.html.');
    return;
  }

  // ── Initialise Firebase ─────────────────────────────────────
  var app = null;
  var db  = null;

  try {
    // Avoid double-initialisation if the page reloads
    if (!firebase.apps.length) {
      app = firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      app = firebase.apps[0];
    }
    db = firebase.database();
    console.log('[Firebase] Connected ✅');
  } catch(e) {
    console.warn('[Firebase] Init failed:', e.message);
    return;
  }

  // ── Helper: get current player ID ───────────────────────────
  function getPlayerId() {
    return localStorage.getItem('dreamdrop_current_player') || 'guest';
  }

  // ── Helper: Firebase path for a player's progress ───────────
  function progressPath(pid) {
    return 'dreamdrop/players/' + pid + '/progress';
  }

  // ── firebaseSync — called by saveProgress() after localStorage save
  //    Writes the full progress object to Firebase in background.
  window.firebaseSync = function(data) {
    if (!db || !navigator.onLine) return;
    var pid = getPlayerId();
    db.ref(progressPath(pid)).set(data)
      .then(function()  { console.log('[Firebase] Progress synced for player:', pid); })
      .catch(function(e){ console.warn('[Firebase] Sync failed:', e.message); });
  };

  // ── firebaseClear — called by resetProgress()
  window.firebaseClear = function() {
    if (!db || !navigator.onLine) return;
    var pid = getPlayerId();
    db.ref(progressPath(pid)).remove()
      .catch(function(e){ console.warn('[Firebase] Clear failed:', e.message); });
  };

  // ── firebaseLoad — fetch progress from Firebase (used on new device)
  //    Called automatically on page load if localStorage has no data.
  window.firebaseLoad = function(callback) {
    if (!db || !navigator.onLine) { callback(null); return; }
    var pid = getPlayerId();
    db.ref(progressPath(pid)).once('value')
      .then(function(snapshot) {
        var data = snapshot.val();
        if (data) {
          // Write to localStorage so game uses it immediately
          var key = 'dreamdrop_progress_' + pid;
          localStorage.setItem(key, JSON.stringify(data));
          console.log('[Firebase] Progress loaded from cloud for player:', pid);
        }
        callback(data);
      })
      .catch(function(e) {
        console.warn('[Firebase] Load failed:', e.message);
        callback(null);
      });
  };

  // ── Mouse data sync — save movement data per level ──────────
  //    Called by stopTrackingAndExport() replacement below.
  window.firebaseSaveMouseData = function(levelName, movements) {
    if (!db || !navigator.onLine || !movements || !movements.length) return;
    var pid = getPlayerId();
    var path = 'dreamdrop/players/' + pid + '/mouseData/' + levelName.replace(/\s/g,'_');
    var entry = {
      timestamp:  new Date().toISOString(),
      level:      levelName,
      pointCount: movements.length,
      duration:   movements.length > 1
        ? ((movements[movements.length-1].time - movements[0].time) / 1000).toFixed(1) + 's'
        : '0s',
      // Store every 5th point to keep data small (still shows the path)
      path: movements.filter(function(_,i){ return i % 5 === 0; })
              .map(function(m){ return { x: Math.round(m.x), y: Math.round(m.y) }; })
    };
    db.ref(path).set(entry)
      .then(function()  { console.log('[Firebase] Mouse data saved for:', levelName); })
      .catch(function(e){ console.warn('[Firebase] Mouse data save failed:', e.message); });
  };

  // ── Sync players list ────────────────────────────────────────
  //    Saves the full players array (name, jersey, photo thumbnail)
  //    so the teacher dashboard can list all students.
  window.firebaseSyncPlayers = function() {
    if (!db || !navigator.onLine) return;
    try {
      var players = JSON.parse(localStorage.getItem('dreamdrop_players') || '[]');
      // Don't store full base64 photos in Firebase — just name + jersey
      var summary = players.map(function(p) {
        return {
          id:          p.id,
          name:        p.name,
          jerseyColor: p.jerseyColor,
          jerseyNum:   p.jerseyNum,
          created:     p.created
          // photo intentionally excluded — stays local only
        };
      });
      db.ref('dreamdrop/players_summary').set(summary)
        .catch(function(e){ console.warn('[Firebase] Players sync failed:', e.message); });
    } catch(e) {}
  };

  // ── On page load: if localStorage is empty, try Firebase ────
  //    Handles the "new device" case where child logs in on a
  //    different tablet and their progress loads from cloud.
  (function checkAndLoad() {
    var pid = getPlayerId();
    if (!pid || pid === 'guest') return;
    var localKey = 'dreamdrop_progress_' + pid;
    var hasLocal = !!localStorage.getItem(localKey);

    if (!hasLocal && navigator.onLine) {
      console.log('[Firebase] No local data — checking cloud for player:', pid);
      if (typeof firebaseLoad === 'function') {
        firebaseLoad(function(data) {
          if (data) {
            // Reload the roadmap/home if we got cloud data
            console.log('[Firebase] Restored progress from cloud.');
          }
        });
      }
    }
  })();

  // ── Sync players list on load ────────────────────────────────
  if (navigator.onLine) {
    setTimeout(function() {
      if (typeof firebaseSyncPlayers === 'function') firebaseSyncPlayers();
    }, 2000);
  }

  // ── Reconnect sync — when device comes back online ───────────
  window.addEventListener('online', function() {
    console.log('[Firebase] Back online — syncing...');
    // Re-sync current progress
    try {
      var pid = getPlayerId();
      var localKey = 'dreamdrop_progress_' + pid;
      var raw = localStorage.getItem(localKey);
      if (raw && typeof firebaseSync === 'function') {
        firebaseSync(JSON.parse(raw));
      }
    } catch(e) {}
    if (typeof firebaseSyncPlayers === 'function') firebaseSyncPlayers();
  });

  console.log('[Firebase] Sync engine ready. Online:', navigator.onLine);

})();
