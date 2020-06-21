(async function reloader(reconnecting) {
  if (reconnecting) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  let res;

  try {
    res = await fetch('/-reloader');
  } catch (e) {
    if (e instanceof TypeError) { // network (or CORS) error
      reloader(true);
      return;
    } else {
      throw e;
    }
  }

  if (!res.ok) {
    reloader(true);
    return;
  }

  if (reconnecting) {
    location.reload(); // reloading is required because events may have been missed until reconnection is established
    return;
  }

  try {
    for await (const line of eachLine(res.body.getReader())) {
      switch (line) {
        case '--- changed ---':
          location.reload();
          return;
        case '--- keepalive ---':
          // do nothing
          break;
        default:
          console.warn(`unexpected message: ${line}`);
          break;
      }
    }
  } catch (e) {
    if (e instanceof ReadError) {
      reloader(true);
      return;
    } else {
      throw e;
    }
  }

  reloader(true); // streaming response is over, try to reconnect
})(false);

class ReadError extends Error {
  constructor(cause) {
    super(cause.message);

    this.cause = cause;
    this.name  = 'TogoStanzaReloaderReadError';
  }
}

async function* eachLine(reader) {
  const decoder = new TextDecoder();

  let buf = '';

  for (;;) {
    let done, value;

    try {
      ({done, value} = await reader.read());
    } catch (e) {
      throw new ReadError(e);
    }

    if (done) { break; }

    buf += decoder.decode(value);

    for (;;) {
      const newlinePos = buf.indexOf('\n');

      if (newlinePos === -1) { break; }

      yield buf.slice(0, newlinePos);
      buf = buf.slice(newlinePos + 1);
    }
  }

  if (buf === '') { return; }

  yield buf;
}
