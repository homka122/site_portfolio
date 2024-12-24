/*!
 * Start Bootstrap - Resume v7.0.6 (https://startbootstrap.com/theme/resume)
 * Copyright 2013-2023 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
 */
//
// Scripts
//

window.onload = async function () {
    const username = document.querySelector(".username");

    const data = await (await fetch("/api/getUserData")).json();
    console.log({ data });

    if (data.login || data.given_name) {
        const usernameText = document.querySelector("#username");
        usernameText.textContent = data.login || data.given_name;

        const authButtons = document.querySelectorAll(".auth-button");
        authButtons.forEach((b) => {
            b.hidden = true;
        });
        username.hidden = false;
    }
};

const exitButton = document.querySelector("#authexit");
exitButton.addEventListener("click", async () => {
    await fetch("/api/logout");

    window.location.href = "/";
});

window.addEventListener("DOMContentLoaded", async (event) => {
    const username = document.querySelector(".username");
    username.hidden = true;
    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector("#sideNav");
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: "#sideNav",
            rootMargin: "0px 0px -40%",
        });
    }

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector(".navbar-toggler");
    const responsiveNavItems = [].slice.call(document.querySelectorAll("#navbarResponsive .nav-link"));
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener("click", () => {
            if (window.getComputedStyle(navbarToggler).display !== "none") {
                navbarToggler.click();
            }
        });
    });
});
