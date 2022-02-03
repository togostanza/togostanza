# Inter-stanza Communication

You may want to coordinate multiple stanzas in order to provide a more sophisticated user experience. Togostanza supports this in several ways. Since stanzas are WebComponents, we have designed the mechanism as much as possible without deviating from WebComponent-like behavior.

## Sending events

If you want to send out a message from a stanza, just dispatch an event containing the message from the host element of the stanza. This can be done as follows:

```javascript
export default class extends Stanza {
  async render() {
    this.element.dispatchEvent(
      new CustomEvent('valueChanged', { detail: { value: 42 } })
    );
  }
}
```

The code in the snippet sends out the `valueChanged` event. The body of the message is encapsulated within the `detail` property of the event.

If you're going to receive the message on the webpage embedding this stanza, you can use `addEventListener()` as follows (assuming that receiving message from `<togostanza-foo>`):

```javascript
const stanzaElement = document.getElementsByTagName('togostanza-foo')[0];

stanzaElement.addEventListener('valueChanged', (event) => {
  console.log('event received', event);
  console.log(event.detail); // {value: 42}
});
```

Theoretically, you could combine them in any way to achieve inter-stanza coordination. That being said, it is too flexible and it will require a lot of work.

Therefore, togostanza provides a mechanism to simplify inter-stanza communication by putting some conventions:

- Dispatch an instance of `CustomEvent`. (Although you can dispatch any kind of the `Event` with `dispatchEvent()`)
- All necessary data are packed in `detail` of the `Event`.
- List the name and description of the events to send in the `outgoingEvent` section of `metadata.json`

Following these conventions, the functions provided by togostanza can make inter-stanza coordination more convenient.

In this example case, the case that the stanza is going to send `valueChanged` messages out, you will need to write something like the following in `metadata.json` of the `foo` stanza:

```json
...
    "stanza:outgoingEvent": [
        {
            "stanza:key": "valueChanged",
            "stanza:description": "event used to notify a change of the value. payload is something like {value: 42}"
        }
    ]
...
```

## Receiving events

There are two main ways for a stanza to receive events: one is to use attribute values, and the other is to define `handleEvent()` method in the stanza class. Either way, use `<togostanza--container>` to wrap the sending and receiving stanzas (Note that here we put two dashes between "togostanza" and "container". This indicates that this is a togostanza built-in element). The container element will bridge the events stanzas.

## Receiving events via attributes (stanza parameters)

First, let's explain how to receive via HTML attributes. This is the simple and recommended way, although it is not very flexible as the `handleEvent()` way.

```html
<togostanza--container>
  <togostanza--event-map
    on="valueChanged"
    receiver="togostanza-bar"
    value-path="value"
    target-attribute="v"
  ></togostanza--event-map>

  <togostanza-foo></togostanza-foo>
  <togostanza-bar></togostanza-bar>
</togostanza--container>
```

Here, `<togostanza--event-map>` does most of the work. Let's take a closer look. This can be read as:

- If `valueChanged` event is emitted,
- put the property `value` of the detail of the event (payload),
- to the attribute `say-to`
- of the stanzas matching CSS selector `togostanza-bar` within the container

In short, if a stanza within the container emits the event as follows,

```javascript
...
    this.element.dispatchEvent(
        new CustomEvent("valueChanged", { detail: { value: 42 } })
    );
```

Then `togostanza-bar` will receive that as being:

```html
<togostanza-bar v="42"></togostanza-bar>
```

Using this mechanism, the receiving stanzas do not need to do anything special to handle the event. It just needs to react appropriately to changes of the attributes, i.e. `this.params`. Events are seamlessly passed as normal stanza parameters thanks to `togostanza--event-map`.

The `value-path` attribute is used to "drill down" to the value of the event detail. If omitted, the detail object itself will be passed to the attribute specified as `target-attribute` (in this case, `{value: 42}`. If we use `json` as `stanza:type` for `v`, we can receive the object with `this.params.v` directly). The `value-path` accepts `path` of `lodash.get`. See [https://lodash.com/docs/4.17.15#get](https://lodash.com/docs/4.17.15#get) for details.

Again, note that even in the case of using `togostanza-event--map`, events that are not listed in `stanza:outgoingEvent` will not be propagated by the container.

## Receiving events via handleEvent()

Corresponding to dispatching events, there is also a way to receive events by defining an event handler in the stanza. This method gives you more control of event handling. However, at the same time, this method is a bit complicated, so it is recommended to use `togostanza--event-map` if it is sufficient for your needs.

Suppose the `baz` stanza receives an event. First, list the events being received in `stanza:incomingEvent` in `metadata.json` of the `baz` stanza:

```json
...
    "stanza:incomingEvent": [
        {
            "stanza:key": "valueChanged",
            "stanza:description": "event used to notify a change of the value. payload is something like {value: 42}"
        }
    ]
...
```

Second, define `handleEvent` method of the stanza class in `index.js`:

```javascript
export default class extends Stanza {
  // ...
  handleEvent(event) {
    this.renderTemplate({
      template: 'stanza.html.hbs',
      parameters: {
        name: event.detail.value,
      },
    });
  }
  // ...
}
```

Finally, wrap the stanzas with `togostanza--container`:

```html
<togostanza--container>
  <togostanza-foo></togostanza-foo>
  <togostanza-baz></togostanza-baz>
</togostanza--container>
```

With this setup, the `baz` stanza's `handleEvent` method will be called when the `foo` stanza fires a `valueChanged` event. Since the event object is passed to the `handleEvent` method, you can arbitrarily handle the value contained in the event.

## Efficient data acquisition from URL

There are some cases where you want to retrieve data from the same URL among multiple stanzas. In such a case, `togostanza--data-source`, which is provided as an application function of `togostanza--container`, is useful. Using this function, you can issue HTTP request only once, and share the content fetched among stanzas.

As an example, consider the scenario where a request to [https://api.github.com/orgs/togostanza/repos](https://api.github.com/orgs/togostanza/repos) is issued and the result is received by both the `qux` and `quux` stanzas. Both the `qux` stanza and the `quux` stanza will receive the URL of the data to be retrieved in the parameter `data-url`. For example, the `qux` stanza looks like this:

```javascript
// stanzas/qux/index.js

export default class extends Stanza {
  async render() {
    const dataUrl = this.params['data-url'];
    if (!dataUrl) {
      return;
    }
    const receivedData = await fetch(dataUrl).then((res) => res.json());
    this.renderTemplate({
      template: 'stanza.html.hbs',
      parameters: {
        receivedData: JSON.stringify(receivedData, null, '  '),
      },
    });
  }
}
```

```html
{{! stanzas/qux/templates/stanza.html.hbs}}

<pre><code>{{receivedData}}</code></pre>
```

Nothing special, just fetch the URL passed to `this.params["data-url"]`. The `quux` stanza will be somewhat similar, so I'll skip it here.

Wrap these `qux` and `quux` stanzas with `togostanza--data-container` and include `togostanza--data-source` in the container:

```html
<togostanza--container>
  <togostanza--data-source
    url="https://api.github.com/orgs/togostanza/repos"
    receiver="togostanza-qux, togostanza-quux"
    target-attribute="data-url"
  ></togostanza--data-source>

  <togostanza-qux></togostanza-qux>
  <togostanza-quux></togostanza-quux>
</togostanza--container>
```

That's it. The container will fetch the data from the URL based on the `url` parameter of the `togostanza--data-source` attribute, and prepare a special internal URL that stanzas can fetch the data from. That will be passed to the attribute specified with the `target-attribute` of the stanzas, which will be specified in the `receiver` (which is a CSS selector).

Technically speaking, a URL created by `URL.createObjectURL()` will be passed to the stanzas. See [https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) for details.

Even if more than one `togostanza--data-source` is specified, as long as their url attributes are the same, remote access will be done only once. You will need to do this if the target attribute needs to be different.
