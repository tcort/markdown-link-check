# section links test

We will test GitHub markdown links to headings. Correct links should resolve
while misspellings should result in a 404.

## Level two heading

#### Level four heading

### Test Same Name repeating

##### Test same Name Repeating

```bash
# This is a comment in a code block
```

Link to [Level two heading](#level-two-heading) should work.

Link to [Misspelled Level two heading](#level-two-headingg) should 404.

Link to [Level four heading](#level-four-heading) should work.

Link to [Test Same Name repeating](#test-same-name-repeating) should work.

Link to [Second Test same Name Repeating](#test-same-name-repeating-1) should work.

Link to [Third nonexistent Test same Name Repeating](#test-same-name-repeating-2) should 404.

Link to [comment in code block](#this-is-a-comment-in-a-code-block) should 404.

Link to [Level two heading using baseurl](https://BASEURL#level-two-heading) should work.

Link to [Level two heading using baseurl with slash](https://BASEURL/#level-two-heading) should work.

Link to [Level two heading using baseurl with slashes](https://BASEURL////#level-two-heading) should work.
