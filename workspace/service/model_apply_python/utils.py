import torch
import torch.nn as nn
from torchvision import datasets, transforms
from torch.autograd import Variable
from PIL import Image
import os
import numpy as np
import glob
import pickle
import gzip
import random
import math
import PIL.ImageOps
default_model_dir = "./"

def normalize_image(img):
    """
    Make image zero centered and in between (-1, 1)
    """
    normalized = (img / 127.5) - 1.
    return normalized

def normalize_function(img):
    img = (img - img.min()) / (img.max() - img.min())
    img = (img - img.mean()) / (img.std())
    return img

def renormalize_image(img):
    renormalized = (img + 1) * 127.5
    return renormalized


def load_checkpoint(model_dir):
    latest_filename = os.path.join(model_dir, 'latest.txt')
    if os.path.exists(latest_filename):
        with open(latest_filename, 'r') as fin:
            model_filename = fin.readlines()[0]
    else:
        return None
    print("=> loading checkpoint '{}'".format(model_filename))
    state = torch.load(model_filename,  map_location='cpu')
    return state

if __name__ == '__main__':
    Package_Data_onehot_Slice_Loder(1)
