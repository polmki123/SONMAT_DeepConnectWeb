import sys
import os

print(sys.argv[1])
print(os.path.exists(sys.argv[1]))
print(os.path.isfile(sys.argv[1]))
print(os.path.isdir(sys.argv[1]))
