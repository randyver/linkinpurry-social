self.addEventListener("push", (event) => {
  const data = event.data.json();

  self.registration.showNotification(data.notification.title, {
    body: data.notification.message,
    icon: "./logo-icon.svg",
    data: { url: data.notification.data.url },
  });
});

self.addEventListener("notificationclick", (event) => {
  const { url } = event.notification.data;
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});