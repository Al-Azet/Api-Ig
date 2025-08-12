export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new Response(
        JSON.stringify({ status: false, error: "Tambahkan ?url=..." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      const formBody = new URLSearchParams({
        q: url,
        w: "",
        p: "home",
        lang: "en",
      });

      const res = await fetch("https://yt1s.io/api/ajaxSearch", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: "https://yt1s.io",
          Referer: "https://yt1s.io/",
          "User-Agent": "Mozilla/5.0",
        },
        body: formBody.toString(),
      });

      const data = await res.json();

      const matches = [...data.data.matchAll(/<a[^>]+href="([^"]+)"[^>]*title="([^"]+)"/g)];

      let media = {
        Thumb: "",
        Video: [],
        Foto: [],
      };

      for (let m of matches) {
        let title = m[2].toLowerCase();
        let link = m[1];

        if (title.includes("thumbnail")) {
          media.Thumb = link;
        } else if (title.includes("video")) {
          media.Video.push(link);
        } else if (title.includes("foto") || title.includes("image")) {
          media.Foto.push(link);
        }
      }

      const jsonResponse = {
        status: true,
        developer: "@Al_Azet",
        media: media,
      };

      let jsonString = JSON.stringify(jsonResponse, null, 2);

      // Sisipkan satu baris kosong antara "developer" dan "media"
      jsonString = jsonString.replace(
        /(\n\s+"developer": "[^"]+")(\n\s+"media":)/,
        `$1\n\n$2`
      );

      return new Response(jsonString, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ status: false, error: err.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
