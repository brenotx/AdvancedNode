import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchBlog } from "../../actions";

const s3ImageDomain = "https://s3-sa-east-1.amazonaws.com/btx-blog-bucket/";

class BlogShow extends Component {
    componentDidMount() {
        this.props.fetchBlog(this.props.match.params._id);
    }

    renderImage() {
        if (this.props.blog.imageUrl) {
            return <img src={s3ImageDomain + this.props.blog.imageUrl} alt="post" />;
        }
    }

    render() {
        if (!this.props.blog) {
            return "";
        }

        const { title, content } = this.props.blog;

        return (
            <div>
                <h3>{title}</h3>
                <p>{content}</p>
                {this.renderImage()}
            </div>
        );
    }
}

function mapStateToProps({ blogs }, ownProps) {
    return { blog: blogs[ownProps.match.params._id] };
}

export default connect(
    mapStateToProps,
    { fetchBlog }
)(BlogShow);
