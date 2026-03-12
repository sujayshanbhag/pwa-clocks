const config = [
  { id: "india", name: "INDIA", zone: "Asia/Kolkata" },
  { id: "usa", name: "NEW YORK", zone: "America/New_York" },
  { id: "uk", name: "LONDON", zone: "Europe/London" },
  { id: "france", name: "PARIS", zone: "Europe/Paris" },
  { id: "japan", name: "TOKYO", zone: "Asia/Tokyo" },
  { id: "australia", name: "SYDNEY", zone: "Australia/Sydney" },
];

let clocks = [];

async function init() {
  let anyClockOffline = false;

  const fetchPromises = config.map(async (c) => {
    try {
      const res = await fetch(
        `https://timeapi.io/api/Time/current/zone?timeZone=${c.zone}`,
      );
      const data = await res.json();

      // Check the flag from SW
      if (data.isOffline === true) {
        anyClockOffline = true;
      }

      const apiMs = new Date(data.dateTime).getTime();
      return {
        instance: new StationClock(c.id, c.name),
        offset: apiMs - Date.now(),
      };
    } catch (e) {
      anyClockOffline = true;
      return { instance: new StationClock(c.id, c.name), offset: 0 };
    }
  });

  clocks = await Promise.all(fetchPromises);

  document
    .querySelectorAll(".loading-text")
    .forEach((el) => (el.style.display = "none"));
  animate();
}

function animate() {
  const now = Date.now();
  clocks.forEach((c) => {
    c.instance.draw(new Date(now + c.offset));
  });
  requestAnimationFrame(animate);
}

init();
