import torch
import torch.nn as nn
import torch.nn.functional as F

# def ResNet18():
#     return ResNet(BasicBlock, [2,2,2,2])

# def ResNet34():
#     return ResNet(BasicBlock, [3,4,6,3])

# def ResNet50():
#     return ResNet(BasicBlock, [3,4,6,3])

# def ResNet101():
#     return ResNet(BasicBlock, [3,4,23,3])

# def ResNet152():
#     return ResNet(BasicBlock, [3,8,36,3])


class BasicBlock(nn.Module):

    def __init__(self, in_channels, out_channels, stride, downsample=None):
        super(BasicBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels) #
        self.relu = nn.ReLU(True)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.downsample = downsample
        
        if downsample is not None:
            self.downsample = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False), #avgPooling?
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x):
        residual = x
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)

        out = self.conv2(out)
        out = self.bn2(out)

        if self.downsample is not None:
            residual = self.downsample(x)

        out += residual
        out = self.relu(out)
        return out

class ResNet(nn.Module):
    def __init__(self, num_classes=2350, resnet_layer=56):
        super(ResNet, self).__init__()
        self.conv1 = nn.Conv2d(9, 32, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(32)
        self.relu = nn.ReLU(inplace=True)
        self.Tanh = nn.Tanh()
        self.n = 18

        self.Class_Maxpool = nn.MaxPool2d(kernel_size=4, stride=4)
        self.fc_out = nn.Linear(8192, num_classes)

        # 32 64 64
        self.layer1 = nn.Sequential()
        self.layer1.add_module('layer1_0', BasicBlock(in_channels=32, out_channels=32, stride=1, downsample=None))
        for i in range(1,self.n):
            self.layer1.add_module('layer1_%d' % (i), BasicBlock(in_channels=32, out_channels=32, stride=1, downsample=None))

        # 32 64 64
        self.layer2 = nn.Sequential()
        self.layer2.add_module('layer2_0', BasicBlock(in_channels=32, out_channels=64, stride=2, downsample=True))
        for i in range(1,self.n):
            self.layer2.add_module('layer2_%d' % (i), BasicBlock(in_channels=64, out_channels=64, stride=1, downsample=None))

        # 64 32 32
        self.layer3 = nn.Sequential()
        self.layer3.add_module('layer3_0', BasicBlock(in_channels=64, out_channels=128, stride=2, downsample=True))
        for i in range(1,self.n):
            self.layer3.add_module('layer3_%d' % (i), BasicBlock(in_channels=128, out_channels=128, stride=1, downsample=None))
        # 128 16 16
        
        self.layer4 = nn.Sequential()
        self.layer4.add_module('layer4_0', BasicBlock(in_channels=128, out_channels=256, stride=2, downsample=True))
        for i in range(1,self.n):
            self.layer4.add_module('layer4_%d' % (i), BasicBlock(in_channels=256, out_channels=256, stride=1, downsample=None))
        # 256 8 8


        self.MSEavgpool = nn.AvgPool2d(kernel_size=2, stride=2)
        # self.Tanh = nn.Tanh()

    def forward(self, x):

        x = self.relu(self.bn1(self.conv1(x)))
        
        Cross_out = self.Class_Maxpool(x)
        Cross_out = Cross_out.view(Cross_out.size(0), -1)
        Cross_out = self.fc_out(Cross_out)

        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)

        MSE_out = self.MSEavgpool(x) #256*4*4
        MSE_out = MSE_out.view(MSE_out.size(0), 1, 64, 64)
        MSE_out = self.Tanh(MSE_out)

        return  Cross_out, MSE_out
