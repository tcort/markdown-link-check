# Sample

This is a test file leveraging the local replacement patterns `{{BASEURL}}` for `/`:

![img](/test/hello.jpg) (alive)
![img](%%BASE_URL%%/hello.jpg) (alive)
![img](hello.jpg) (alive)
![img](./hello.jpg) (alive)
![img](/test/goodbye.jpg) (dead)
![img](/hello.jpg) (dead)



<!-- markdown-link-check-disable -->
![img](goodbye.jpg) (dead)
<!-- markdown-link-check-enable -->
<!-- markdown-link-check-disable-next-line -->
![img](goodbye.jpg) (dead)
![img](goodbye.jpg) (dead) <!-- markdown-link-check-disable-line -->
<!-- markdown-link-check-disable -->
![img](goodbye.jpg) (dead)
