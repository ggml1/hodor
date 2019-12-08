import requests
import sys

def main():
  url = str(sys.argv[1])

  response = requests.get(url)

  if (response.status_code == 200):
    response = response.json()
    test_result = response['msg']
    if (test_result != "True"):
      raise Exception(F'Integration tests failed.')
  else:
    raise Exception(F'GET failed - {response.status_code}')

  return 0

if (__name__ == '__main__'):
  main()
