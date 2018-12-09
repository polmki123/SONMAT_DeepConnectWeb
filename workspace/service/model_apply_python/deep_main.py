import torch
import torch.nn as nn
import torch.backends.cudnn as cudnn
import torchvision.transforms as transforms
from torch.autograd import Variable
#from . import utils
import utils
import sys
import os
import time
import glob
import cv2
from PIL import Image, ImageFilter
import numpy as np
import PIL.ImageOps
from model import *

os.environ["CUDA_VISIBLE_DEVICES"] = '0'

def input_Deepmodel_image(inputimagedir):
    frame_dir = '/home/deep_user/frame_label/'
    frame_names = os.listdir(frame_dir)
    input_data = list()
    for frame in frame_names:
        frame_image = np.array(Image.open(frame_dir + frame)).reshape(1, 64, 64)
        input_image = np.array(Image.open(inputimagedir))
        input_image = np.array(np.split(input_image, 8, axis=1))  # 8*64*64
        Concat_data = np.append(input_image, frame_image, axis=0)
        if ((9, 64, 64) == Concat_data.shape):
            input_data.append(Concat_data)

    return input_data, frame_names



def make_image(inputimagedir, model_dir, save_image_dir):
    start_time = time.time()
    input_data, output_name = input_Deepmodel_image(inputimagedir)
    utils.default_model_dir = model_dir
    model = ResNet()
    
    if torch.cuda.is_available():
        print("USE", torch.cuda.device_count(), "GPUs!")
        model = nn.DataParallel(model).cuda()
        cudnn.benchmark = True

    else:
        print("NO GPU -_-;")

    checkpoint = utils.load_checkpoint(model_dir)
    if not checkpoint:
        pass
    else:
        model.load_state_dict(checkpoint['state_dict'])
        model.eval()
        print('make image')
        print(save_image_dir)
        make_image_process(input_data, model, output_name, save_image_dir)

    now = time.gmtime(time.time() - start_time)
    print('{} hours {} mins {} secs for data'.format(now.tm_hour, now.tm_min, now.tm_sec))


def make_image_process(input_data, model, output_name, save_image_dir):
    input_data = np.array(input_data)
    train_data = torch.from_numpy(input_data)
    train_loader = torch.utils.data.DataLoader(dataset=train_data, batch_size=128, shuffle=False, num_workers = 4)
    result_data = []

    for data_set in train_loader :
        if torch.cuda.is_available():
            data_set = Variable(data_set.cuda())
        else:
            data_set = Variable(data_set)
        data_set = data_set.type(torch.cuda.FloatTensor)
        data_set = utils.normalize_image(data_set)
        output = model(data_set)
        output = Variable(output[1]).data.cpu().numpy()
        output = utils.renormalize_image(output)
        result_data.extend(output)

    for count in range(len(result_data)):
        output = result_data[count]
        output = output.reshape(64, 64)
        img = Image.fromarray(output.astype('uint8'), 'L')
        img = img.filter(ImageFilter.SHARPEN)
        if not os.path.exists(save_image_dir):
            os.makedirs(save_image_dir)
        img.save(save_image_dir + output_name[count][:-4] + '.png', "PNG")
    
def get_directory_path(dir_path):

    directory_path = dir_path[0]
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

    for dir_index in range(len(dir_path)):

        if dir_index == 0: continue

        directory_path = directory_path + dir_path[dir_index]
        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

    return directory_path
    


def Image_Preprocess(inputimagedir):
	img = Image.open(inputimagedir)
	img = img.convert('L')
	img.save(inputimagedir, "PNG")

if __name__ == "__main__":
    
    inputimagedir = sys.argv[1]
    font_id = sys.argv[2]

    Image_Preprocess(inputimagedir)
    # inputimagedir = '/home/deep_user/repository/120/handwrite_image.jpg'
    # font_id = 120

    model_dir = '/home/deep_user/model/'
    model_dir2 = '/home/deep_user/model/'
    model_dir3 = '/home/deep_user/model/'

    repository_dir = get_directory_path(['/home/deep_user/repository', '/' + str(font_id)])

    save_image_dir_1 = get_directory_path([repository_dir, '/save_image', '/1/'])
    save_image_dir_2 = get_directory_path([repository_dir, '/save_image', '/2/'])
    save_image_dir_3 = get_directory_path([repository_dir, '/save_image', '/3/'])

    make_image(inputimagedir, model_dir, save_image_dir_1)
    make_image(inputimagedir, model_dir2, save_image_dir_2)
    make_image(inputimagedir, model_dir3, save_image_dir_3)
