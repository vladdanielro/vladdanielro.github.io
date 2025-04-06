let watchId;
let prevPosition = null;
let totalDistance = 0;
let maxSpeed = 0;
let intervalId;
let isTracking = false;

document.getElementById("start").addEventListener("click", () => {
  if (isTracking) {
    stopTracking();
  } else {
    startTracking();
  }
});

function startTracking() {
  if ("geolocation" in navigator) {
    watchId = navigator.geolocation.watchPosition(
      updatePosition,
      err => alert("Eroare la localizare: " + err.message),
      { enableHighAccuracy: true }
    );
    document.getElementById("start").textContent = "Stop";
    isTracking = true;
  } else {
    alert("Geolocația nu este suportată de browser.");
  }
}

function stopTracking() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  document.getElementById("start").textContent = "Start";
  isTracking = false;
}

function updatePosition(position) {
  const { latitude, longitude, speed } = position.coords;
  document.getElementById("coords").textContent = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  if (prevPosition) {
    const d = getDistanceFromLatLonInKm(
      prevPosition.latitude,
      prevPosition.longitude,
      latitude,
      longitude
    );
    totalDistance += d;
  }
  prevPosition = { latitude, longitude };

  if (speed > maxSpeed) {
    maxSpeed = speed;
  }

  const kmh = speed ? (speed * 3.6).toFixed(1) : "0";
  document.getElementById("speed").textContent = kmh;
  document.getElementById("distance").textContent = totalDistance.toFixed(2);
  document.getElementById("vma").textContent = (maxSpeed * 3.6).toFixed(1);

  smoothUpdateSpeed(kmh);
}

function smoothUpdateSpeed(targetSpeed) {
  clearInterval(intervalId);
  let currentSpeed = parseFloat(document.getElementById("speed").textContent);
  let step = (targetSpeed - currentSpeed) / 10;
  intervalId = setInterval(() => {
    currentSpeed += step;
    if (Math.abs(currentSpeed - targetSpeed) < 0.1) {
      currentSpeed = targetSpeed;
      clearInterval(intervalId);
    }
    document.getElementById("speed").textContent = currentSpeed.toFixed(1);
  }, 200);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker înregistrat"))
    .catch(console.error);
}
