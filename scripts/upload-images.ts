/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');




const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or service role key missing');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const IMAGES_DIR = path.resolve(__dirname, '../sample-images'); // your local images folder
const CAPTIONS_FILE = path.resolve(__dirname, '../captions/Flickr8k.token.txt'); // single captions file

// Read captions file and create a map: { 'filename.jpg' => ['caption1', 'caption2', ...] }
const captionLines = fs.readFileSync(CAPTIONS_FILE, 'utf-8').split('\n');
const captionsMap: Record<string, string[]> = {};

captionLines.forEach((line: string) => {
  if (!line.trim()) return;
  const [fullName, caption] = line.split('\t');
  const filename = fullName.split('#')[0]; // remove #0, #1, etc.
  if (!captionsMap[filename]) captionsMap[filename] = [];
  captionsMap[filename].push(caption.trim());
});

async function run() {
  const files = fs.readdirSync(IMAGES_DIR).filter((f: string) => /\.(jpg|jpeg|png)$/i.test(f));

  for (const filename of files) {
    const imagePath = path.join(IMAGES_DIR, filename);
    const fileBuffer = fs.readFileSync(imagePath);

    // Take first caption for demo (or join all)
    const caption = captionsMap[filename]?.[0] || 'No caption available';

    // Upload to Supabase public bucket
    await supabase.storage.from('images').upload(`demo/${filename}`, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    // Insert into images table
    await supabase.from('images').insert({
      file_path: `demo/${filename}`,
      caption,
    });

    console.log('Uploaded + saved:', filename, 'Caption:', caption);
  }

  console.log('All images uploaded!');
}

run().catch(console.error);
