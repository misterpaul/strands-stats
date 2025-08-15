# Request

create a single regex that works in node.js that when applied to the text at the end of this message and extracts (1) the number in the first line, (2) the complete second line between the double quotes (=E2=80=9C), and (3) all unicode text, spaces, and newlines on the following lines. Anything after the unicode should not be included.

```
Strands #482 
=E2=80=9C... not included=E2=80=9D =F0=9F=9F=A1=F0=9F=94=B5=F0=9F=94=B5=F0=9F=94=B5 =F0=9F=94=B5=F0=9F=94=B5

Sent from my mobile device. Pardon teh typos.=
```

# Response

Of course. Here is a single regular expression designed for Node.js that will extract the three pieces of data you need from the email body.

This solution assumes the regex will be applied to the plain text body of the email after it has been decoded from its "quoted-printable" format. This is consistent with your project's use of the mailparser library, which handles this decoding for you automatically.

The Regular Expression
javascript
/Strands\s+#(\d+)\s+“([^”]+)”\s+([\p{Emoji}\s]+)/u
How It Works
This regex is designed to be robust, handling variations in whitespace and newlines between the data elements.

Strands\s+#(\d+)

Matches the literal text Strands #.
\s+ matches one or more whitespace characters (like spaces or newlines).
(\d+) is the first capture group, capturing one or more digits for the game number.
\s+“([^”]+)”

\s+ matches the whitespace separating the first line from the title.
“ matches the opening smart quote.
([^”]+) is the second capture group. It captures every character until it finds a closing smart quote, grabbing the full title.
” matches the closing smart quote.
\s+([\p{Emoji}\s]+)

\s+ matches the whitespace separating the title from the results.
([\p{Emoji}\s]+) is the third capture group. It greedily captures a continuous block of one or more characters that are either a Unicode emoji (\p{Emoji}) or any whitespace character (\s, which includes spaces and newlines). It stops capturing as soon as it encounters a non-emoji, non-whitespace character (like the "S" in "Sent from...").
/u

The u flag at the end is crucial. It enables Unicode-aware matching, which is required for \p{Emoji} to work correctly.
Node.js Example
Here is how you would use this regex in your Node.js Cloud Function.

javascript
// This is the decoded text body your function would get from mailparser.
const emailBody = `
Strands #482
“... not included”
🟧🔵🔵🔵
🔵🔵

Sent from my mobile device. Pardon teh typos.
`;

// The regex to extract the data.
const gameDataRegex = /Strands\s+#(\d+)\s+“([^”]+)”\s+([\p{Emoji}\s]+)/u;

const match = emailBody.match(gameDataRegex);

if (match) {
  const gameData = {
    gameNumber: parseInt(match[1], 10),
    gameTitle: match[2].trim(),
    results: match[3].trim(),
  };

  console.log(JSON.stringify(gameData, null, 2));
} else {
  console.log("Could not find game data in the email body.");
}
Expected Output
Running the code above will produce the following clean, structured JSON object:

json
{
  "gameNumber": 482,
  "gameTitle": "... not included",
  "results": "🟧🔵🔵🔵\n🔵🔵"
}

