# Sample

This is a test file:

* [redirect-loop](%%BASE_URL%%/loop) (dead)
* [valid](%%BASE_URL%%/foo/bar) (alive)
* [invalid](%%BASE_URL%%/foo/dead) (dead)
* [dns-resolution-fail](http://example.example.example.com/) (dead)
* [nohead-get-ok](%%BASE_URL%%/nohead) (alive)
* [redirect](%%BASE_URL%%/foo/redirect) (alive)
* [valid-external](http://google.de) (alive)
* [valid-external-basic-auth](https://httpbin.org/basic-auth/foo/bar) (alive)

![img](%%BASE_URL%%/hello.jpg) (alive)
![img](hello.jpg) (alive)

Here are some e-mail addresses:

* [valid](mailto:linuxgeek@gmail.com)
* [invalid](mailto:foo@bar@baz)