import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import MailIcon from "@material-ui/icons/Mail";
import { TextField } from "@material-ui/core";
import ImageUploader from "react-images-upload";
import { Send } from "@material-ui/icons";
import { uploadInstant } from "./pinqubator.service";

const useStyles = makeStyles({
    list: {
        width: 500,
    },
    fullList: {
        width: "auto",
    },
});

export default function TemporaryDrawer() {
    const classes = useStyles();
    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });
    const [input, setInput] = React.useState({});
    React.useEffect(() => console.log(input), [input]);

    const toggleDrawer = (anchor, open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        if (open === true) {
            setState({ ...state, [anchor]: open });
        }
    };

    const onDrop = (picture) => {
        setInput({ ...input, picture });
    };

    function handlePermission() {
        return navigator.permissions.query({ name: "geolocation" });
    }
    function send(form) {
        navigator.geolocation.getCurrentPosition(function (position) {
            form.set("lat", position.coords.latitude);
            form.set("long", position.coords.longitude);
            uploadInstant(form).then(() => {
                setInput({});
                handleClose();
            });
        });
    }

    const handleUpload = () => {
        const form = new FormData();
        if (!input.picture) {
            alert("must upload a picture");
            return;
        }
        form.append("image", input.picture[0]);
        if (!input.username) {
            alert("must set a username");
            return;
        }
        form.set("username", input.username);
        if (!input.title) {
            alert("must set a title");
            return;
        }
        form.set("title", input.title);
        form.set("timestamp", new Date().toISOString());
        if ("geolocation" in navigator) {
            send(form);
        } else {
            handlePermission().then((res) => {
                if (res.state === "granded") {
                    send(form);
                }
            });
        }
    };

    const handleClose = () => setState({ ...state, right: false });

    const list = (anchor) => (
        <div
            className={clsx(classes.list, {
                [classes.fullList]: anchor === "top" || anchor === "bottom",
            })}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List>
                {["username", "title"].map((text, index) => (
                    <ListItem button key={text}>
                        <ListItemIcon>
                            {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                        </ListItemIcon>
                        <ListItemText primary={text} />
                        <TextField
                            value={(input && input[text]) || ""}
                            id="outlined-basic"
                            label={text.substring(0,1).toUpperCase()+text.substring(1)}
                            size="medium"
                            variant="outlined"
                            onChange={(e) => {
                                let inp = { ...input };
                                inp[text] = e.target.value;
                                setInput(inp);
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            <Divider />
            <ImageUploader
                withIcon={true}
                buttonText="Choose images"
                onChange={onDrop}
                imgExtension={[".jpg", ".gif", ".png", ".gif"]}
                maxFileSize={5242880}
            />
            <Button style={{ marginLeft: 100 }} onClick={handleUpload}>
                Send
            </Button>
            <Button
                style={{ marginLeft: 100 }}
                onClick={handleClose}
            >
                Close
            </Button>
        </div>
    );

    return (
        <div>
            {["add image"].map((anchor) => (
                <React.Fragment key={anchor}>
                    <Button onClick={toggleDrawer("right", true)}>
                        {anchor}
                    </Button>
                    <Drawer
                        anchor={"right"}
                        open={state.right}
                        onClose={toggleDrawer("right", false)}
                    >
                        {list("right")}
                    </Drawer>
                </React.Fragment>
            ))}
        </div>
    );
}
