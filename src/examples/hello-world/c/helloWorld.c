
int message[12] = {72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33};

__attribute__((visibility("default"))) int helloWorld(int a)
{
  return message[a];
}

__attribute__((visibility("default"))) int add(int a, int b)
{
  return a + b;
}
