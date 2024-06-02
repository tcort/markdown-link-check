# Foo

<!-- markdownlint-disable MD033 -->
<a id="tomato_id"></a>

<a name="tomato_name"></a>

<div id="onion"></div>
<div id="onion_outer">
    <div id="onion_inner"></div>
</div>

<!--
<a id="tomato_comment"></a>
-->

<!-- markdownlint-enable MD033 -->

This is a test.

HTML anchor in code `<a id="tomato_code"></a>` should be ignored.

<!-- markdownlint-disable-next-line MD033 -->
Ignore escaped backticks \`<a id="tomato_escaped_backticks"></a>\`. Link should work.

## Bar

The title is [Foo](#foo).

## Baz

The second section is [Bar](#bar).

## Uh, oh

There is no section named [Potato](#potato).

There is an anchor named with `id` [Tomato](#tomato_id).

There is an anchor named with `name` [Tomato](#tomato_name).

There is an anchor in code [Tomato in code](#tomato_code).

There is an anchor in escaped code [Tomato in escaped backticks](#tomato_escaped_backticks).

There is an anchor in HTML comment [Tomato in comment](#tomato_comment).

There is an anchor in single div [Onion](#onion).

There is an anchor in outer div [Onion outer](#onion_outer).

There is an anchor in inner div [Onion inner](#onion_inner).

## Header with special char ✨

Test [header with image](#header-with-special-char-)
