const AWS = require("aws-sdk");
const uuid = require("uuid/v1");
const keys = require("../config/keys");
const requireLogin = require("../middlewares/requireLogin");

const s3 = new AWS.S3({
    accessKeyId: keys.s3AccessKeyId,
    secretAccessKey: keys.s3Secret
});

module.exports = app => {
    app.get("/api/upload", requireLogin, (req, res) => {
        console.log("USERID: " + req.user.id);
        const key = `${req.user.id}/${uuid()}.jpeg`;

        console.log(key);

        s3.getSignedUrl(
            "putObject",
            {
                Bucket: "btx-blog-bucket",
                ContentType: "image/jpeg",
                Key: key
            },
            (err, url) => {
                res.send({ key, url });
            }
        );
    });
};
