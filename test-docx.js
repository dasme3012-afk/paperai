const HTMLtoDOCX = require("html-to-docx");

async function test() {
  try {
    const html = "<p>Hello</p>";
    const buffer = await HTMLtoDOCX(html, null, {
      title: "test",
      orientation: "portrait",
    });
    console.log("Success! isBuffer:", Buffer.isBuffer(buffer), "type:", typeof buffer, "length:", buffer.length);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
