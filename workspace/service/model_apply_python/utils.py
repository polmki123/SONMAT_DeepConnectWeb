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

def save_model_checkpoint(epoch, model, model_dir, number, optimizer):
    if epoch % 20 == 0:
        model_filename = '/checkpoint_%02d.pth.tar' % epoch
        save_checkpoint({
            'epoch': epoch,
            'model': model,
            'state_dict': model.state_dict(),
            'optimizer': optimizer.state_dict(),
        }, model_filename, model_dir + str(number + 1))


def input_Deepmodel_image(inputimagedir):
    frame_dir = '../Deep_model/frame_label/'
    frame_paths = glob.glob(os.path.join(frame_dir, '*.jpg'))
    input_data = list()
    for frame in frame_paths:
        frame_image = np.array(Image.open(frame)).reshape(1, 64, 64)
        input_image = np.array(Image.open(inputimagedir))
        input_image = np.array(np.split(input_image, 8, axis=1))  # 8*64*64
        Concat_data = np.append(input_image, frame_image, axis=0)
        if ((9, 64, 64) == Concat_data.shape):
            input_data.append(Concat_data)
    
    return input_data

def input_Deepmodel2_image(inputimagedir):
    frame_dir = '../Deep_model/frame_label/'
    frame_paths = glob.glob(os.path.join(frame_dir, '*.jpg'))
    input_paths = glob.glob(os.path.join(inputimagedir, '*.png'))
    input_data = list()
    for i in len(frame_paths):
        frame_image = np.array(Image.open(frame_paths[i])).reshape(1, 64, 64)
        input_image = np.array(Image.open(input_paths[i])).reshape(1, 64, 64)
        Concat_data = np.append(input_image, frame_image, axis=0)# 2*64*64
        if ((9, 64, 64) == Concat_data.shape):
            input_data.append(Concat_data)
    
    return input_data

def check_model_result_image(epoch, model, number):
    if epoch % 10 == 0:
        saveimagedir = '../ResNet_Test1/save_font_image/' + str(number) + '/' + str(epoch) + '/'
        inputimagedir = '../Deep_model/test1.jpg'
        input_data = input_Deepmodel2_image(inputimagedir)
        model.eval()
        check_point = 0
        for i in input_data:
            check_point = check_point + 1
            i = np.array(i)
            i = i.reshape(1, 9, 64, 64)
            input = torch.from_numpy(i)
            input = Variable(input.cuda())
            input = input.type(torch.cuda.FloatTensor)
            input = normalize_image(input)
            output = model(input)
            output = Variable(output[1]).data.cpu().numpy()
            output = output.reshape(64, 64)
            # print(output)
            output =renormalize_image(output)
            img = Image.fromarray(output.astype('uint8'), 'L')
            #img = PIL.ImageOps.invert(img)
            if not os.path.exists(saveimagedir):
                os.makedirs(saveimagedir)
            img.save(saveimagedir + str(check_point) + 'my.jpg')


def check_model2_result_image(epoch, model, number):
    if epoch % 10 == 0:
        saveimagedir = '../ResNet_Test1/save_font_image2/' + str(number) + '/' + str(epoch) + '/'
        inputimagedir = '../ResNet_Test1/save_image/'
        input_data = input_Deepmodel2_image(inputimagedir)
        model.eval()
        check_point = 0
        for i in input_data:
            check_point = check_point + 1
            i = np.array(i)
            i = i.reshape(1, 9, 64, 64)
            input = torch.from_numpy(i)
            input = Variable(input.cuda())
            input = input.type(torch.cuda.FloatTensor)
            input = normalize_image(input)
            output = model(input)
            output = Variable(output[1]).data.cpu().numpy()
            output = output.reshape(64, 64)
            # print(output)
            output =renormalize_image(output)
            img = Image.fromarray(output.astype('uint8'), 'L')
            #img = PIL.ImageOps.invert(img)
            if not os.path.exists(saveimagedir):
                os.makedirs(saveimagedir)
            img.save(saveimagedir + str(check_point) + 'my.jpg')
            
def chunker(seq, size):
    return (seq[pos:pos + size] for pos in range(0, len(seq), size))

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

def save_checkpoint(state, filename, model_dir):
    
    model_filename = model_dir + filename
    print(model_filename)
    latest_filename = os.path.join(model_dir, 'latest.txt')

    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    with open(latest_filename, 'w') as fout:
        fout.write(model_filename)

    torch.save(state, model_filename)
    print("=> saving checkpoint '{}'".format(model_filename))

    return

def load_checkpoint(model_dir):
    latest_filename = os.path.join(model_dir, 'latest.txt')
    if os.path.exists(latest_filename):
        with open(latest_filename, 'r') as fin:
            model_filename = fin.readlines()[0]
    else:
        return None
    print("=> loading checkpoint '{}'".format(model_filename))
    state = torch.load(model_filename)
    return state

def print_log(text, filename="log.txt"):
    if not os.path.exists(default_model_dir):
        os.makedirs(default_model_dir)
    model_filename = os.path.join(default_model_dir, filename)
    with open(model_filename, "a") as myfile:
        myfile.write(text + "\n")


def make_one_hot() :
    a = np.array([a for a in range(2350)])
    return a


def Package_Data_onehot_Slice_Loder(number):
    # read train data
    numpy_x = list()
    numpy_label = list()
    numpy_onehot = list()
    with gzip.open('../Deep_model/Conpress/train_' + str(number) + '.pkl', "rb") as of:
        while True:
            try:
                e = pickle.load(of)
                numpy_x.extend(e[0])
                numpy_label.extend(e[1])
                numpy_onehot.extend(make_one_hot())
                if len(numpy_x) % 1000 == 0:
                    print("processed %d examples" % len(numpy_x))
            except EOFError:
                print('error')
                break
            except Exception:
                print('error')
                pass
        print("unpickled total %d examples" % len(numpy_x))
    
    X_datas = np.array(numpy_x)
    print(X_datas.shape)
    label_datas = np.array(numpy_label)
    print(label_datas.shape)
    onehot_datas = np.array(numpy_onehot)
    print(onehot_datas.shape)

    # read test data
    numpy_test = list()
    numpy_label_test = list()
    numpy_onehot_test = list()
    with gzip.open('../Deep_model/Conpress/test_' + str(number) + '.pkl', "rb") as of:
        while True:
            try:
                e = pickle.load(of)
                numpy_test.extend(e[0])
                numpy_label_test.extend(e[1])
                numpy_onehot_test.extend(make_one_hot())
                if len(numpy_test) % 1000 == 0:
                    print("processed %d examples" % len(numpy_test))
            except EOFError:
                print('error')
                break
            except Exception:
                print('error')
                pass
        print("unpickled total %d examples" % len(numpy_test))
    
    X_test_datas = np.array(numpy_test)
    print(X_test_datas.shape)
    test_label_datas = np.array(numpy_label_test)
    print(test_label_datas.shape)
    onehot_test_datas = np.array(numpy_onehot_test)
    print(onehot_test_datas.shape)
    #make train, test dataset
    train_dataset = torch.utils.data.TensorDataset(torch.from_numpy(X_datas), torch.from_numpy(label_datas), torch.from_numpy(onehot_datas))
    test_dataset = torch.utils.data.TensorDataset(torch.from_numpy(X_test_datas), torch.from_numpy(test_label_datas),  torch.from_numpy(onehot_test_datas))
    
    return train_dataset, test_dataset

def Second_Package_Data_onehot_Slice_Loder(number):
    # read train data
    numpy_x = list()
    numpy_label = list()
    numpy_onehot = list()
    with gzip.open('../ResNet_Test1/Conpress/Resnet_train.pkl', "rb") as of:
        while True:
            try:
                e = pickle.load(of)
                numpy_x.extend(e[0])
                numpy_label.extend(e[1])
                numpy_onehot.extend(make_one_hot())
                if len(numpy_x) % 1000 == 0:
                    print("processed %d examples" % len(numpy_x))
            except EOFError:
                print('error')
                break
            except Exception:
                print('error')
                pass
        print("unpickled total %d examples" % len(numpy_x))
    
    X_datas = np.array(numpy_x)
    print(X_datas.shape)
    label_datas = np.array(numpy_label)
    print(label_datas.shape)
    onehot_datas = np.array(numpy_onehot)
    print(onehot_datas.shape)

    # read test data
    numpy_test = list()
    numpy_label_test = list()
    numpy_onehot_test = list()
    with gzip.open('../ResNet_Test1/Conpress/Resnet_test.pkl', "rb") as of:
        while True:
            try:
                e = pickle.load(of)
                numpy_test.extend(e[0])
                numpy_label_test.extend(e[1])
                numpy_onehot_test.extend(make_one_hot())
                if len(numpy_test) % 1000 == 0:
                    print("processed %d examples" % len(numpy_test))
            except EOFError:
                print('error')
                break
            except Exception:
                print('error')
                pass
        print("unpickled total %d examples" % len(numpy_test))
    
    X_test_datas = np.array(numpy_test)
    print(X_test_datas.shape)
    test_label_datas = np.array(numpy_label_test)
    print(test_label_datas.shape)
    onehot_test_datas = np.array(numpy_onehot_test)
    print(onehot_test_datas.shape)
    #make train, test dataset
    train_dataset = torch.utils.data.TensorDataset(torch.from_numpy(X_datas), torch.from_numpy(label_datas), torch.from_numpy(onehot_datas))
    test_dataset = torch.utils.data.TensorDataset(torch.from_numpy(X_test_datas), torch.from_numpy(test_label_datas),  torch.from_numpy(onehot_test_datas))
    
    return train_dataset, test_dataset

if __name__ == '__main__':
    Package_Data_onehot_Slice_Loder(1)
