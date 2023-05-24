import { Button, Grid, TextField } from "@mui/material";
import React from "react";

export default function BasicInfo({
  name,
  setName,
  setFile,
  fileName,
  setFileName,
}) {
  const handleChange = (event) => {
    if (event.target.files[0] && event.target.files[0].type.includes("image")) {
      setFile(event.target.files[0]);
      setFileName(event.target.files[0].name);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          variant="standard"
          autoComplete="given-name"
          name="name"
          required
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </Grid>
      <Grid item xs={12}>
        <div>
          <Button
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            style={{
              borderRadius: "20px",
              backgroundColor: "#2fb5be",
            }}
          >
            <label>
              <input type="file" onChange={handleChange} accept="image/*" />
              {fileName}
            </label>
          </Button>
        </div>
      </Grid>
    </Grid>
  );
}
