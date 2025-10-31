import { Fragment, useState } from "react";
import { Box, Card, CardContent } from "@mui/material";
import PageTitle from "../../components/PageTitle";
import { Shapes } from "lucide-react";
import CategoryForm from "./CategoryForm";
import { SaveCategory } from "../../services/category.service";
import ProgressBar from "../../components/ProgressBar";
import { useToast } from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/constants";

function CreateCategory() {
    const navigate = useNavigate();
    const { successToast, errorToast } = useToast();
    const [loader, setLoader] = useState(false);
    const [formLoader, setFormLoader] = useState(false);

    const onSubmit = (data) => {
        setLoader(true);
        SaveCategory(data).then((res) => {
            if(res.status) {
                successToast('Created successfully');
                console.log(res.data.uuid);
                navigate(ROUTES.CATEGORY.EDIT(res.data.uuid));
            } else {
                errorToast(res.errorMessage || 'Failed to save category');
            }
        }).finally(() => {
            setLoader(false);
        });
    }

    return (
        <Fragment>
            <PageTitle title="Add Category" titleIcon={<Shapes />} />
            <Card>
                <ProgressBar formLoader={formLoader}/>
                <CardContent>
                    <CategoryForm formLoader={formLoader} loader={loader} callback={onSubmit}/>
                </CardContent>
            </Card>
        </Fragment>
    )
}

export default CreateCategory;