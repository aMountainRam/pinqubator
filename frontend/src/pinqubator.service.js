import axios from "axios";
const URL = `https://${process.env.REACT_APP_APIHOST}:${process.env.REACT_APP_APIPORT}/${process.env.REACT_APP_APIBASE}`;

export function getInstants(username) {
    const url = `${URL}/instants${username === "" ? "" : "/" + username}`;
    return axios.get(url);
}

export function uploadInstant(form) {
    return axios.post(`${URL}/instants`, form, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}
