import { FileUpload } from 'primereact/fileupload';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { ProgressSpinner } from 'primereact/progressspinner';
import UserAvatar from '../../../components/UserAvatar/UserAvatar';

const ProfilePhoto = ({ profilePhotoUrl, onUpload }) => {
  return profilePhotoUrl.trim() === '' ? (
    <div className='col-12 md:col-4'>
      <UserAvatar avatar={profilePhotoUrl} />
      <FileUpload
        mode='basic'
        accept='image/*'
        name='profilePhoto'
        customUpload
        uploadHandler={onUpload}
        style={{ marginTop: 10 }}
      />
    </div>
  ) : (
    <div className='col-12 md:col-4'>
      <LazyLoadImage
        src={`${process.env.REACT_APP_S3_BUCKET_URL}/${profilePhotoUrl}`}
        alt='profile photo'
        style={{ width: '100%' }}
        placeholder={
          <div>
            <ProgressSpinner />
          </div>
        }
      />
      <FileUpload
        mode='basic'
        accept='image/*'
        name='profilePhoto'
        customUpload
        uploadHandler={onUpload}
        style={{ marginTop: 10 }}
      />
    </div>
  );
};

export default ProfilePhoto;
