# Sample

This is a test file:

* [redirect-loop](%%BASE_URL%%/loop) (dead)
* [valid](%%BASE_URL%%/foo/bar) (alive)
* [invalid](%%BASE_URL%%/foo/dead) (dead)
* [dns-resolution-fail](http://example.example.example.com/) (dead)
* [nohead-get-ok](%%BASE_URL%%/nohead) (alive)
* [redirect](%%BASE_URL%%/foo/redirect) (alive)
* [basic-auth](%%BASE_URL%%/basic-auth) (alive)
* [ignored](%%BASE_URL%%/something/not-working-and-ignored/something) (ignored)
* [replaced](%%BASE_URL%%/boo/bar)

![img](%%BASE_URL%%/hello.jpg) (alive)
![img](hello.jpg) (alive)

Here are some e-mail addresses:

* [valid](mailto:linuxgeek@gmail.com?subject=test)
* [invalid](mailto:foo@bar@baz)

Here are some invalid protocols:

* [hhttppss](hhttppss://example.org)
* [applesauce](applesauce://example.org)
