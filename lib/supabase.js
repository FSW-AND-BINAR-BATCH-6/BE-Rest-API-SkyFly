const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? "";
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const uploadFile = async (file) => {
    try {
        const filename = `${Date.now()}.png`;
        const { error } = await supabase.storage
            .from(`${SUPABASE_BUCKET}`)
            .upload(`Final/public/skyfly/${filename}`, file.buffer, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.mimetype,
            });

        if (error) {
            throw new Error(error.message);
        }

        const url = `${SUPABASE_URL}/storage/v1/object/public/Final/public/skyfly/${filename}`;
        return url;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

module.exports = {
    uploadFile,
};
