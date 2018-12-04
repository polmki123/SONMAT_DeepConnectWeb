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
from PIL import Image
import numpy as np
import PIL.ImageOps
from model import *



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
	model = nn.DataParallel(model)
	checkpoint = utils.load_checkpoint(model_dir+str(12))
	if not checkpoint:
		pass
	else:
		model.load_state_dict(checkpoint['state_dict'])
		model.eval()
		make_image_process(input_data, model, output_name, save_image_dir)

	now = time.gmtime(time.time() - start_time)
	print('{} hours {} mins {} secs for data'.format(now.tm_hour, now.tm_min, now.tm_sec))


def make_image_process(input_data, model, output_name, save_image_dir):
	for count in range(len(input_data)):
		i = input_data[count]
		i = np.array(i)
		i = i.reshape(1, 9, 64, 64)
		input = torch.from_numpy(i)
		input = input.type(torch.FloatTensor)
		input = utils.normalize_image(input)
		output = model(input)
		output = Variable(output[1]).data.cpu().numpy()
		output = output.reshape(64, 64)
		output = utils.renormalize_image(output)
		output = utils.normalize_function(output)
		img = Image.fromarray(output.astype('uint8'), 'L')
		img = PIL.ImageOps.invert(img)
		img.save(save_image_dir + output_name[count][:-4] + '.png', "PNG")


	
if __name__ == "__main__":
    inputimagedir = sys.argv[1]
    font_id = sys.argv[2]

    model_dir = '/home/deep_user/model/'

    repository_dir = '/home/deep_user/repository/' + str(font_id)
    print(repository_dir)

    save_image_dir_1 = repository_dir + '/save_image/1/'
    save_image_dir_2 = repository_dir + '/save_image/2/'
    save_image_dir_3 = repository_dir + '/save_image/3/'
    print(save_image_dir_1)

    make_image(inputimagedir, model_dir, save_image_dir_1)
    make_image(inputimagedir, model_dir, save_image_dir_2)
    make_image(inputimagedir, model_dir, save_image_dir_3)
