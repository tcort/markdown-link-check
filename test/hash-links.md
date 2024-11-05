# Foo

<!-- markdownlint-disable MD033 -->
<a id="tomato_id"></a>
<a name="tomato_name"></a>

<a id='tomato_id_single_quote'></a>
<a name='tomato_name_single_quote'></a>

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

To test a failure. Link that [does not exist](#does-not-exist).

## Uh, oh

There is no section named [Potato](#potato).

There is an anchor named with `id` [Tomato](#tomato_id).

There is an anchor named with `name` [Tomato](#tomato_name).

There is an anchor named with `id` [Tomato in single quote](#tomato_id_single_quote).

There is an anchor named with `name` [Tomato in single quote](#tomato_name_single_quote).

There is an anchor in code [Tomato in code](#tomato_code).

There is an anchor in escaped code [Tomato in escaped backticks](#tomato_escaped_backticks).

There is an anchor in HTML comment [Tomato in comment](#tomato_comment).

There is an anchor in single div [Onion](#onion).

There is an anchor in outer div [Onion outer](#onion_outer).

There is an anchor in inner div [Onion inner](#onion_inner).

## Header with special char at end ✨

Test [header with image](#header-with-special-char-at-end-)

## Header with multiple special chars at end ✨✨

Test [header with multiple images](#header-with-multiple-special-chars-at-end-)

## Header with special ✨ char

Test [header with image](#header-with-special--char)

## Header with multiple special ✨✨ chars

Test [header with multiple images](#header-with-multiple-special--chars)

## Header with German umlaut Ö

Link to [German umlaut Ö](#header-with-german-umlaut-ö)

## Header with German umlaut ö manual encoded link

Link to [German umlaut ö manual encoded in link](#header-with-german-umlaut-%C3%B6-manual-encoded-link)

### [Heading with a link](https://github.com/tcort/markdown-link-check)

An [anchor link](#heading-with-a-link) to a heading.

### [Heading with an anchor link](#foo)

An [anchor link](#heading-with-an-anchor-link) to a heading.

## --docker

[--docker](#--docker)

## Step 7 - Lint & Test

[Step 7 - Lint \& Test](#step-7---lint--test)

## Product Owner / Design Approval

[Product Owner / Design Approval](#product-owner--design-approval)

## Migrating from `<= v1.18.0`

Whitespaces separated by special characters (no workaround)

[migrating from <= v1.18.0](#migrating-from--v1180)

## Client/server examples using  `network.peer.*

Consequent whitespaces typo (easy to workaround)

[Client/server examples using `network.peer.*`](#clientserver-examples-using--networkpeer)

## This header is [linked](#somewhere)

This is a [link to a linked header](#this-header-is-linked)

### Somewhere

## L. Is the package in the Linux distro base image?

Anchor links ending with `?`.

[L. Is the package in the Linux distro base image?](#l-is-the-package-in-the-linux-distro-base-image)
