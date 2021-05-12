import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { getInstants } from "./pinqubator.service";
import TemporaryDrawer from "./Sidebar";
import { Button } from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";

const useStyles = makeStyles((theme) => ({
    root: {
        "& > *": {
            margin: theme.spacing(1),
            width: "25ch",
        },
    },
}));

export default function SearchPage() {
    const [val,setVal] = React.useState("");
    const [data, setData] = React.useState([]);

    const classes = useStyles();
    const inputDiv = {
        width: "100%",
        display: "flex",
        justifyContent: "center",
    };
    const page = {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
    };
    const handleRefresh = () => {
        val && val !== "" && getInstants(val)
            .then((d) => {
                console.log(d.data);
                setData(d.data);
            })
            .catch(() => setData([]));
    }
    const handleChange = (event) => {
        let v = event.target.value;
        setVal(v);
        v && v !== "" && getInstants(v)
            .then((d) => {
                console.log(d.data);
                setData(d.data);
            })
            .catch(() => setData([]));
    };
    return (
        <div style={page}>
            <TemporaryDrawer />
            <Button onClick={handleRefresh}>
                <RefreshIcon />
            </Button>
            <div style={inputDiv}>
                <form className={classes.root} noValidate autoComplete="off">
                    <TextField
                        id="outlined-basic"
                        label="Username"
                        size="medium"
                        variant="outlined"
                        onChange={handleChange}
                    />
                </form>
            </div>
            <div style={{display: "inline-block"}}>
                {data.map((img) => (
                    <img
                        key={img.image.jobId}
                        src={img.image.buffer && `data:image/jpeg;base64,${Buffer.from(
                            img.image.buffer.data
                        ).toString("base64")}`}
                        alt={img.image.originalname}
                    />
                ))}
            </div>
        </div>
    );
}
