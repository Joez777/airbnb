import { Application } from "@hotwired/stimulus";

const application = Application.start();

// Configure Stimulus development experience
application.debug = false;
window.Stimulus = application;

export { application };

const swiper = new Swiper(".swiper", {
  // Optional parameters
  loop: true,
});
