import express, { response } from "express";
import cookieParser from "cookie-parser";
require("dotenv").config();

const app = express();
const port = 80;

const GITHUB = { secret: process.env.GITHUB_SECRET, client: process.env.GITHUB_CLIENT };
const GOOGLE = {
    secret: process.env.GOOGLE_SECRET,
    client: process.env.GOOGLE_CLIENT,
};

app.use(express.static("./static"));
app.use(cookieParser());

const data: { [client_id: string]: { token: string; method: "github" | "gmail" } } = {};

async function getGithubUser(token: string) {
    const data = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${token}` } });
    const json = await data.json();

    return json;
}

async function getGoogleUser(token: string) {
    const data = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
        headers: { Authorization: `Bearer ${token}` },
    });
    const json = await data.json();

    return json;
}

app.get("/api/callback/github", async (req, res) => {
    let url = "https://github.com/login/oauth/access_token?";
    url += `client_id=${GITHUB.client}`;
    url += `&client_secret=${GITHUB.secret}`;
    url += `&code=${req.query?.code}`;
    url += `&redirect_uri=${"https://about.homka122.ru/api/callback/github"}`;

    const token = (await (await (await fetch(url, { method: "POST" })).blob()).formData())
        .get("access_token")
        ?.toString();

    if (!token) {
        res.send("Internal error");
        return;
    }

    const uuid = crypto.randomUUID();
    res.cookie("sessionid", uuid, { httpOnly: true, secure: true, maxAge: 360000 });
    data[uuid] = { token, method: "github" };

    res.redirect("/");
});

app.get("/api/callback/google", async (req, res) => {
    let url = "https://oauth2.googleapis.com/token?";
    url += `client_id=${GOOGLE.client}`;
    url += `&client_secret=${GOOGLE.secret}`;
    url += `&code=${req.query?.code}`;
    url += `&redirect_uri=${"https://about.homka122.ru/api/callback/google"}`;
    url += `&grant_type=authorization_code`;

    const userData = await fetch(url, { method: "POST" });
    const json = await userData.json();

    const token: string = json.access_token;

    if (!token) {
        res.send("Internal error");
        return;
    }

    const uuid = crypto.randomUUID();
    res.cookie("sessionid", uuid, { httpOnly: true, secure: true, maxAge: 360000 });
    data[uuid] = { token, method: "gmail" };

    res.redirect("/");
});

app.get("/api/getUserData", async (req, res) => {
    if (!req.cookies.sessionid) {
        res.sendStatus(403);
        return;
    }

    const userToken = data[req.cookies.sessionid];
    if (!userToken) {
        res.sendStatus(403);
        return;
    }

    let userData;
    if (userToken.method == "github") {
        userData = await getGithubUser(userToken.token);
    }
    if (userToken.method == "gmail") {
        userData = await getGoogleUser(userToken.token);
    }

    res.json(userData);
});

app.get("/api/logout", async (req, res) => {
    res.clearCookie("sessionid");
    res.end();
});

app.listen(port, () => {
    console.log(`Listening on port ${port}... http://localhost:8080`);
});
