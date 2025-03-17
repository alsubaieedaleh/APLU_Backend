import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AuthProvider, AuthProviderDocument } from './schemas/auth-provider.schema';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, UpdateProfileDto, GoogleLoginDto } from './dto/auth.dto';
import { AuthProvider as AuthProviderEnum } from '../common/enums/auth-provider.enum';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  email: string;
  sub: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly SELECT_FIELDS = 'email firstName lastName isVerified authProvider profile';

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AuthProvider.name) private authProviderModel: Model<AuthProviderDocument>,
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Partial<UserDocument>> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userModel.create({
      ...registerDto,
      password: hashedPassword,
    });

    const { password, ...result } = user.toJSON();
    return result;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      email: user.email, 
      sub: user._id.toString(),
      userId: user._id.toString(),
      role: user.role 
    };
    const secret = this.configService.get('JWT_SECRET') || 'test-secret';
    return {
      access_token: this.jwtService.sign(payload, { secret }),
    };
  }

  // Only support Google login
  async googleLogin(googleUser: GoogleLoginDto): Promise<any> {
    const user = await this.userModel.findOneAndUpdate(
      { email: googleUser.email },
      {
        $set: {
          email: googleUser.email,
          fullName: `${googleUser.firstName} ${googleUser.lastName}`,
          isVerified: true,
          authProvider: 'google',
        },
      },
      {
        upsert: true,
        new: true,
        lean: true,
        projection: 'email fullName isVerified',
      },
    );

    return {
      token: this.createToken(user),
      user: {
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<any> {
    const updateObj = {};

    if (updateProfileDto.firstName) updateObj['firstName'] = updateProfileDto.firstName;
    if (updateProfileDto.lastName) updateObj['lastName'] = updateProfileDto.lastName;
    if (updateProfileDto.avatar) updateObj['profile.avatar'] = updateProfileDto.avatar;
    if (updateProfileDto.bio) updateObj['profile.bio'] = updateProfileDto.bio;
    if (updateProfileDto.academicLevel) updateObj['profile.academicLevel'] = updateProfileDto.academicLevel;
    if (updateProfileDto.preferredLanguage) updateObj['profile.preferredLanguage'] = updateProfileDto.preferredLanguage;

    const user = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $set: updateObj },
      { 
        new: true, 
        lean: true,
        select: this.SELECT_FIELDS,
      },
    );

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.authProvider === AuthProviderEnum.GOOGLE && updateProfileDto.password) {
      throw new BadRequestException('Google users cannot update their password');
    }

    return user;
  }

  async deleteAccount(userId: string): Promise<void> {
    await Promise.all([
      this.userModel.deleteOne({ _id: userId }),
      this.authProviderModel.deleteMany({ userId }),
    ]);
  }

  async logout(user: JwtPayload): Promise<{ message: string }> {
    // This endpoint is stateless; if token blacklisting is implemented, do it here.
    return { message: 'Logout successful' };
  }

  async refreshToken(refreshDto: { refreshToken: string }): Promise<{ access_token: string }> {
    try {
      const secret = this.configService.get('JWT_SECRET') || 'test-secret';
      const payload = this.jwtService.verify(refreshDto.refreshToken, { ignoreExpiration: false, secret });
      const newPayload = {
        email: payload.email,
        sub: payload.sub,
        role: payload.role,
      };
      const access_token = this.jwtService.sign(newPayload, { secret });
      return { access_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private createToken(user: UserDocument): string {
    const secret = this.configService.get('JWT_SECRET') || 'test-secret';
    return this.jwtService.sign({ sub: user._id, email: user.email }, { secret });
  }

  

  async generateToken(user: any) {
    const secret = this.configService.get('JWT_SECRET') || 'test-secret';
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { secret }),
    };
  }

  async getProfile(user: JwtPayload): Promise<Partial<UserDocument>> {
    const userDoc = await this.userModel
      .findById(user.sub)
      .select('-password')
      .lean()
      .exec();
  
    if (!userDoc) {
      throw new UnauthorizedException('User not found');
    }
  
    return userDoc;
  }
  

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toJSON();
      return result;
    }
    return null;
  }
}
